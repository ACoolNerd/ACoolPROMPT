import { getCurrentUser } from "@/lib/auth";
import { registerCardCode } from "@/lib/actions";

export default async function RegisterCardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const user = await getCurrentUser();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Register a card</h1>
        <p className="opacity-75">
          Received a physical card with a drink purchase, at an event, or in a
          repack? Enter its code below to claim it into your digital
          collection. Golden cards (like the Golden Drink Ticket — good for a
          free drink for someone else) are strictly limited to 10 ever made.
        </p>
      </div>

      {success && (
        <p className="text-sm bg-brand/10 text-brand border border-brand/30 rounded-md px-3 py-2">
          Registered &ldquo;{success}&rdquo; to your collection! +25 bonus points.
        </p>
      )}
      {error && (
        <p className="text-sm bg-red-500/10 text-red-600 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {user ? (
        <form action={registerCardCode} className="flex gap-2">
          <input
            name="code"
            required
            placeholder="e.g. GOLD-DRINK-0001"
            className="flex-1 rounded-md border border-card-border bg-transparent px-3 py-2 uppercase"
          />
          <button className="bg-brand text-white px-5 py-2 rounded-md font-medium hover:bg-brand-dark transition-colors">
            Register
          </button>
        </form>
      ) : (
        <p className="opacity-70 text-sm">
          <a href="/login" className="text-brand underline">Sign in</a> to register a card.
        </p>
      )}

      <div className="text-xs opacity-50">
        Demo codes to try: <code>GOLD-DRINK-0001</code>&ndash;<code>GOLD-DRINK-0007</code>{" "}
        (Golden Drink Ticket) or <code>ACC-CHASE-0001</code>&ndash;<code>ACC-CHASE-0003</code>{" "}
        (ACoolCOLLECTOR autograph chase card).
      </div>
    </div>
  );
}
