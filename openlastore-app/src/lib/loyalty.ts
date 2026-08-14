import { db } from "@/lib/db";
import type { CardTier } from "@/generated/prisma/enums";

export const DRINK_FREE_THRESHOLD = 10;
export const POINTS_PER_DOLLAR = 1;
export const CARD_REGISTRATION_BONUS_POINTS = 25;
export const TAX_RATE = 0.0875;
const GOLDEN_DIGITAL_UPGRADE_CHANCE = 0.15;
const PACK_SLOT_ORDER: CardTier[] = [
  "GUARANTEED_HIT",
  "STAR",
  "ROOKIE",
  "INSERT_PARALLEL",
  "WILD",
];

export async function getActiveSubscription(userId: string) {
  const sub = await db.subscription.findUnique({ where: { userId } });
  if (!sub || sub.status !== "ACTIVE") return null;
  return sub;
}

export async function getPointsBalance(userId: string) {
  const result = await db.pointsLedgerEntry.aggregate({
    where: { userId },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}

/**
 * Records a cash purchase of one product, updates the drink punch card,
 * and awards points (boosted by an active Juice Club subscription).
 */
export async function purchaseProduct(
  userId: string,
  productId: string,
  quantity: number
) {
  const product = await db.product.findUniqueOrThrow({ where: { id: productId } });
  const subtotalCents = product.priceCents * quantity;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  const order = await db.order.create({
    data: {
      userId,
      subtotalCents,
      taxCents,
      totalCents,
      items: {
        create: [
          {
            productId: product.id,
            name: product.name,
            category: product.category,
            quantity,
            unitPriceCents: product.priceCents,
            totalCents: subtotalCents,
          },
        ],
      },
    },
    include: { items: true },
  });

  if (product.category === "DRINK") {
    await bumpPunchCard(userId, quantity);
  }

  const sub = await getActiveSubscription(userId);
  const multiplier = sub?.pointsMultiplier ?? 1;
  const pointsEarned = Math.round((subtotalCents / 100) * POINTS_PER_DOLLAR * multiplier);

  await db.pointsLedgerEntry.create({
    data: {
      userId,
      delta: pointsEarned,
      reason: "PURCHASE",
      note: `${quantity}x ${product.name}`,
      orderId: order.id,
    },
  });

  let opening: Awaited<ReturnType<typeof openMysteryPack>> | null = null;
  if (product.category === "PACK") {
    const pack = await db.mysteryPack.findUniqueOrThrow({ where: { productId: product.id } });
    opening = await openMysteryPack(userId, pack.id, order.id);
  }

  return { order, pointsEarned, opening };
}

async function bumpPunchCard(userId: string, quantity: number) {
  const existing = await db.punchCard.upsert({
    where: { userId },
    create: { userId, punches: 0, freeRedeemed: 0 },
    update: {},
  });

  const totalPunches = existing.punches + quantity;
  const freeEarned = Math.floor(totalPunches / DRINK_FREE_THRESHOLD);
  const remainder = totalPunches % DRINK_FREE_THRESHOLD;

  return db.punchCard.update({
    where: { userId },
    data: {
      punches: remainder,
      freeRedeemed: existing.freeRedeemed + freeEarned,
    },
  });
}

export async function redeemFreeDrink(userId: string) {
  const card = await db.punchCard.findUnique({ where: { userId } });
  if (!card || card.freeRedeemed <= 0) {
    throw new Error("No free drinks available to redeem yet.");
  }
  return db.punchCard.update({
    where: { userId },
    data: { freeRedeemed: card.freeRedeemed - 1 },
  });
}

/**
 * Opens a mystery pack: draws one card per rarity slot from the pack's
 * card series. The WILD slot has a small chance to be upgraded to a
 * pre-reserved GOLDEN (serial-numbered, strictly limited) card instead.
 */
export async function openMysteryPack(
  userId: string,
  mysteryPackId: string,
  orderId?: string
) {
  const pack = await db.mysteryPack.findUniqueOrThrow({ where: { id: mysteryPackId } });
  const slots: CardTier[] = JSON.parse(pack.slotTiers);
  const cardInstanceIds: string[] = [];

  for (const slot of slots) {
    let awardedInstanceId: string | null = null;

    if (slot === "WILD" && Math.random() < GOLDEN_DIGITAL_UPGRADE_CHANCE) {
      const reservedGolden = await db.cardInstance.findFirst({
        where: {
          ownerId: null,
          redeemCode: null,
          template: { series: pack.series, tier: "GOLDEN" },
        },
      });
      if (reservedGolden) {
        const claimed = await db.cardInstance.update({
          where: { id: reservedGolden.id },
          data: { ownerId: userId, acquiredVia: "PACK_OPEN", acquiredAt: new Date() },
        });
        awardedInstanceId = claimed.id;
      }
    }

    if (!awardedInstanceId) {
      const candidates = await db.cardTemplate.findMany({
        where: { series: pack.series, tier: slot },
      });
      const template = candidates[Math.floor(Math.random() * candidates.length)];
      const created = await db.cardInstance.create({
        data: {
          templateId: template.id,
          ownerId: userId,
          acquiredVia: "PACK_OPEN",
          acquiredAt: new Date(),
        },
      });
      awardedInstanceId = created.id;
    }

    cardInstanceIds.push(awardedInstanceId);
  }

  const opening = await db.mysteryPackOpening.create({
    data: {
      userId,
      mysteryPackId,
      orderId,
      cardInstanceIds: JSON.stringify(cardInstanceIds),
    },
  });

  const cards = await db.cardInstance.findMany({
    where: { id: { in: cardInstanceIds } },
    include: { template: true },
  });
  // Preserve slot order for display.
  const ordered = cardInstanceIds.map((id) => cards.find((c) => c.id === id)!);

  return { opening, cards: ordered };
}

export async function redeemPointsForPack(userId: string, mysteryPackId: string) {
  const pack = await db.mysteryPack.findUniqueOrThrow({ where: { id: mysteryPackId } });
  const balance = await getPointsBalance(userId);
  if (balance < pack.pointsCost) {
    throw new Error(`Not enough points. Need ${pack.pointsCost}, have ${balance}.`);
  }

  await db.pointsLedgerEntry.create({
    data: {
      userId,
      delta: -pack.pointsCost,
      reason: "POINTS_REDEMPTION",
      note: `Redeemed points for mystery pack ${pack.id}`,
    },
  });

  return openMysteryPack(userId, mysteryPackId);
}

export async function registerCard(userId: string, rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  const instance = await db.cardInstance.findUnique({
    where: { redeemCode: code },
    include: { template: true },
  });

  if (!instance) throw new Error("That card code wasn't recognized.");
  if (instance.ownerId) throw new Error("That card has already been registered.");

  const claimed = await db.cardInstance.update({
    where: { id: instance.id },
    data: { ownerId: userId, acquiredVia: "CARD_REGISTRATION", acquiredAt: new Date() },
    include: { template: true },
  });

  await db.pointsLedgerEntry.create({
    data: {
      userId,
      delta: CARD_REGISTRATION_BONUS_POINTS,
      reason: "CARD_REGISTRATION_BONUS",
      note: `Registered card: ${claimed.template.name}`,
    },
  });

  return claimed;
}

export { PACK_SLOT_ORDER };
