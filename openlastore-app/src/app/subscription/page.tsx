import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  subscribeToJuiceClub,
  cancelJuiceClub,
  renewJuiceClubPeriod,
  claimMonthlyPackCredit,
} from "@/lib/actions";

export default async function SubscriptionPage() {
  const user = await getCurrentUser();
  const sub = user ? await db.subscription.findUnique({ where: { userId: user.id } }) : null;
  const packs = await db.mysteryPack.findMany({ include: { product: true } });
  const isActive = sub?.status === "ACTIVE";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <p className="uppercase text-xs tracking-widest text-gold font-semibold">Juice Club</p>
        <h1 className="text-3xl font-bold mt-1 mb-2">Juice up your membership</h1>
        <p className="opacity-75">
          $19.99/month · 1.5x points on every purchase · one free mystery pack
          credit every 30-day period · cancel anytime.
        </p>
      </div>

      {!user && (
        <p className="text-center opacity-70 text-sm">
          <a href="/login" className="text-brand underline">Sign in</a> to subscribe.
        </p>
      )}

      {user && (
        <div className="border border-card-border bg-card-bg rounded-xl p-6 space-y-4">
          {isActive ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-brand">Active</p>
                  <p className="text-sm opacity-70">
                    Renews {sub!.currentPeriodEnd.toLocaleDateString()} · {sub!.pointsMultiplier}x points ·{" "}
                    {sub!.creditsRemaining} pack credit{sub!.creditsRemaining === 1 ? "" : "s"} remaining this period
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={renewJuiceClubPeriod}>
                    <button className="border border-card-border px-3 py-1.5 rounded-md text-sm hover:border-brand transition-colors">
                      Simulate monthly renewal
                    </button>
                  </form>
                  <form action={cancelJuiceClub}>
                    <button className="border border-red-500/40 text-red-500 px-3 py-1.5 rounded-md text-sm hover:bg-red-500/10 transition-colors">
                      Cancel
                    </button>
                  </form>
                </div>
              </div>

              {sub!.creditsRemaining > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Claim your monthly pack credit:</p>
                  <div className="flex gap-2 flex-wrap">
                    {packs.map((pack) => (
                      <form key={pack.id} action={claimMonthlyPackCredit}>
                        <input type="hidden" name="mysteryPackId" value={pack.id} />
                        <button className="bg-gold text-black px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                          {pack.product.imageEmoji} Open {pack.product.name}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-3">
              <p className="opacity-80">
                {sub?.status === "CANCELLED"
                  ? "Your Juice Club membership is cancelled. Resubscribe anytime."
                  : "You're not subscribed yet."}
              </p>
              <form action={subscribeToJuiceClub}>
                <button className="bg-gold text-black px-5 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity">
                  Subscribe to Juice Club — $19.99/mo
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 text-center text-sm">
        <Perk emoji="⚡" title="1.5x points" body="Every dollar you spend earns 50% more points toward mystery packs and cards." />
        <Perk emoji="🎁" title="Monthly pack credit" body="One free mystery pack opening every 30-day billing period, no points or cash needed." />
        <Perk emoji="🔁" title="Cancel anytime" body="No lock-in. Cancel and your perks stop at the end of the current period." />
      </div>
    </div>
  );
}

function Perk({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="border border-card-border bg-card-bg rounded-xl p-4">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="font-semibold">{title}</div>
      <div className="opacity-70 mt-1">{body}</div>
    </div>
  );
}
