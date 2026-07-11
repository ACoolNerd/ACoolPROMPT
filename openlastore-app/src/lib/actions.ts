"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import {
  purchaseProduct,
  redeemFreeDrink,
  redeemPointsForPack,
  registerCard,
} from "@/lib/loyalty";

export async function loginOrCreateAccount(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!email) throw new Error("Email is required");

  const user = await db.user.upsert({
    where: { email },
    create: { email, name: name || email.split("@")[0] },
    update: name ? { name } : {},
  });

  await setSessionCookie(user.id);
  redirect("/profile");
}

export async function loginAsDemoUser(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  await setSessionCookie(user.id);
  redirect("/profile");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

export async function buyProduct(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const productId = String(formData.get("productId"));
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));
  const result = await purchaseProduct(user!.id, productId, quantity);

  revalidatePath("/store");
  revalidatePath("/profile");

  if (result.opening) {
    redirect(`/store/reveal/${result.opening.opening.id}`);
  }
  redirect("/store?purchased=1");
}

export async function claimFreeDrink() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    await redeemFreeDrink(user!.id);
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    redirect(`/store?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/profile");
  revalidatePath("/store");
}

export async function redeemPackWithPoints(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const mysteryPackId = String(formData.get("mysteryPackId"));

  let openingId: string;
  try {
    const result = await redeemPointsForPack(user!.id, mysteryPackId);
    openingId = result.opening.id;
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    redirect(`/store?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/profile");
  redirect(`/store/reveal/${openingId}`);
}

export async function registerCardCode(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const code = String(formData.get("code") ?? "");

  let claimedName: string;
  try {
    const claimed = await registerCard(user!.id, code);
    claimedName = claimed.template.name;
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    redirect(`/cards/register?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/profile");
  redirect(`/cards/register?success=${encodeURIComponent(claimedName)}`);
}

export async function hostEvent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db.event.create({
    data: {
      hostId: user!.id,
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      category: String(formData.get("category") || "General"),
      location: String(formData.get("location")),
      isIntimate: formData.get("isIntimate") === "on",
      capacity: Number(formData.get("capacity") ?? 20),
      startsAt: new Date(String(formData.get("startsAt"))),
    },
  });

  revalidatePath("/community");
}

export async function rsvpToEvent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const eventId = String(formData.get("eventId"));
  await db.eventRsvp.upsert({
    where: { eventId_userId: { eventId, userId: user!.id } },
    create: { eventId, userId: user!.id, status: "GOING" },
    update: { status: "GOING" },
  });

  revalidatePath("/community");
}

export async function subscribeToJuiceClub() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  await db.subscription.upsert({
    where: { userId: user!.id },
    create: { userId: user!.id, currentPeriodEnd: periodEnd },
    update: { status: "ACTIVE", cancelledAt: null, currentPeriodEnd: periodEnd, creditsRemaining: 1 },
  });

  revalidatePath("/subscription");
  revalidatePath("/profile");
}

export async function cancelJuiceClub() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db.subscription.update({
    where: { userId: user!.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  revalidatePath("/subscription");
  revalidatePath("/profile");
}

export async function renewJuiceClubPeriod() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  await db.subscription.update({
    where: { userId: user!.id },
    data: { currentPeriodEnd: periodEnd, creditsRemaining: 1 },
  });

  revalidatePath("/subscription");
}

export async function claimMonthlyPackCredit(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const mysteryPackId = String(formData.get("mysteryPackId"));
  const sub = await db.subscription.findUniqueOrThrow({ where: { userId: user!.id } });
  if (sub.status !== "ACTIVE" || sub.creditsRemaining <= 0) {
    throw new Error("No monthly pack credit available.");
  }

  await db.subscription.update({
    where: { userId: user!.id },
    data: { creditsRemaining: sub.creditsRemaining - 1 },
  });

  const { openMysteryPack } = await import("@/lib/loyalty");
  const result = await openMysteryPack(user!.id, mysteryPackId);

  revalidatePath("/subscription");
  redirect(`/store/reveal/${result.opening.id}`);
}
