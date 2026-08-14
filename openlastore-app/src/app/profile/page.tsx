import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPointsBalance } from "@/lib/loyalty";

const TIER_LABEL: Record<string, string> = {
  GUARANTEED_HIT: "Guaranteed Hit",
  STAR: "Star",
  ROOKIE: "Rookie",
  INSERT_PARALLEL: "Insert / Parallel",
  WILD: "Wild Card",
  GOLDEN: "★ GOLDEN ★",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [punchCard, pointsBalance, cards, sub, rsvps, hostedEvents, orders] = await Promise.all([
    db.punchCard.findUnique({ where: { userId: user.id } }),
    getPointsBalance(user.id),
    db.cardInstance.findMany({ where: { ownerId: user.id }, include: { template: true }, orderBy: { acquiredAt: "desc" } }),
    db.subscription.findUnique({ where: { userId: user.id } }),
    db.eventRsvp.findMany({ where: { userId: user.id, status: "GOING" }, include: { event: true } }),
    db.event.findMany({ where: { hostId: user.id }, orderBy: { startsAt: "asc" } }),
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10, include: { items: true } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
        <p className="opacity-70 text-sm">{user.email} · {user.role.toLowerCase()} · member since {user.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Points balance" value={pointsBalance} />
        <StatCard label="Drink punches" value={`${punchCard?.punches ?? 0}/10`} />
        <StatCard label="Free drinks available" value={punchCard?.freeRedeemed ?? 0} />
      </div>

      <section className="border border-card-border bg-card-bg rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Juice Club</h2>
          <Link href="/subscription" className="text-brand text-sm hover:underline">Manage →</Link>
        </div>
        {sub?.status === "ACTIVE" ? (
          <p className="text-sm opacity-80 mt-2">
            Active · {sub.pointsMultiplier}x points · renews {sub.currentPeriodEnd.toLocaleDateString()} ·{" "}
            {sub.creditsRemaining} pack credit{sub.creditsRemaining === 1 ? "" : "s"} left
          </p>
        ) : (
          <p className="text-sm opacity-60 mt-2">Not subscribed.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your collection ({cards.length})</h2>
        {cards.length === 0 ? (
          <p className="opacity-70 text-sm">
            No cards yet — <Link href="/store" className="text-brand underline">open a pack</Link> or{" "}
            <Link href="/cards/register" className="text-brand underline">register a physical card</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`border rounded-xl p-3 bg-card-bg flex flex-col items-center gap-1 text-center ${
                  card.template.tier === "GOLDEN" ? "border-gold" : "border-card-border"
                }`}
              >
                <div className="text-2xl">{card.template.imageEmoji}</div>
                <div className="text-xs uppercase opacity-60">{TIER_LABEL[card.template.tier]}</div>
                <div className="text-sm font-medium">{card.template.name}</div>
                {card.serialNumber && card.template.totalSupply && (
                  <div className="text-xs text-gold">#{card.serialNumber}/{card.template.totalSupply}</div>
                )}
                <div className="text-[10px] opacity-50 uppercase">{card.acquiredVia?.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Events you&apos;re going to</h2>
          {rsvps.length === 0 ? (
            <p className="opacity-70 text-sm">No RSVPs yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {rsvps.map((r) => (
                <li key={r.id} className="border border-card-border rounded-md px-3 py-2">
                  {r.event.title} · {r.event.startsAt.toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Events you&apos;re hosting</h2>
          {hostedEvents.length === 0 ? (
            <p className="opacity-70 text-sm">
              None yet — <Link href="/community" className="text-brand underline">host one</Link>.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {hostedEvents.map((e) => (
                <li key={e.id} className="border border-card-border rounded-md px-3 py-2">
                  {e.title} · {e.startsAt.toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Recent purchases</h2>
        {orders.length === 0 ? (
          <p className="opacity-70 text-sm">No purchases yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {orders.map((o) => (
              <div key={o.id} className="border border-card-border rounded-md px-3 py-2 flex justify-between">
                <span>{o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</span>
                <span className="opacity-60">${(o.totalCents / 100).toFixed(2)} · {o.createdAt.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-card-border bg-card-bg rounded-xl p-5 text-center">
      <div className="text-3xl font-bold text-brand">{value}</div>
      <div className="text-sm opacity-70 mt-1">{label}</div>
    </div>
  );
}
