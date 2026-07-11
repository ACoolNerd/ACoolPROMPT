import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPointsBalance } from "@/lib/loyalty";
import { buyProduct, claimFreeDrink, redeemPackWithPoints } from "@/lib/actions";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { category: "asc" },
  });

  const drinks = products.filter((p) => p.category === "DRINK");
  const items = products.filter((p) => p.category === "ITEM");
  const packs = products.filter((p) => p.category === "PACK");

  const punchCard = user ? await db.punchCard.findUnique({ where: { userId: user.id } }) : null;
  const pointsBalance = user ? await getPointsBalance(user.id) : 0;
  const mysteryPacks = await db.mysteryPack.findMany({ include: { product: true } });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Store</h1>
        <p className="opacity-75">
          Drinks build your punch card. Every purchase earns points. Packs give you
          a shot at collectible cards.
        </p>
      </div>

      {error && (
        <p className="text-sm bg-red-500/10 text-red-600 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {user && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-card-border bg-card-bg rounded-xl p-5">
            <h2 className="font-semibold mb-2">Your drink punch card</h2>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-6 w-6 rounded-full border ${
                    i < (punchCard?.punches ?? 0)
                      ? "bg-brand border-brand"
                      : "border-card-border"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm opacity-70">
              {punchCard?.punches ?? 0}/10 punches · {punchCard?.freeRedeemed ?? 0} free drink(s) available
            </p>
            {(punchCard?.freeRedeemed ?? 0) > 0 && (
              <form action={claimFreeDrink} className="mt-3">
                <button className="bg-gold text-black px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
                  Redeem a free drink
                </button>
              </form>
            )}
          </div>
          <div className="border border-card-border bg-card-bg rounded-xl p-5">
            <h2 className="font-semibold mb-2">Points balance</h2>
            <div className="text-3xl font-bold text-brand">{pointsBalance}</div>
            <p className="text-sm opacity-70 mt-1">
              Earn 1 point per dollar spent (1.5x with Juice Club). Spend points on mystery packs below.
            </p>
          </div>
        </div>
      )}

      <ProductSection title="Drinks" products={drinks} formatCents={formatCents} loggedIn={!!user} />
      <ProductSection title="Items" products={items} formatCents={formatCents} loggedIn={!!user} />

      <section>
        <h2 className="text-xl font-semibold mb-3">Mystery packs</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {packs.map((product) => {
            const pack = mysteryPacks.find((mp) => mp.productId === product.id);
            return (
              <div key={product.id} className="border border-card-border bg-card-bg rounded-xl p-5 flex flex-col gap-3">
                <div className="text-3xl">{product.imageEmoji}</div>
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm opacity-75">{product.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {user ? (
                    <>
                      <form action={buyProduct}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="quantity" value="1" />
                        <button className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors">
                          Buy for {formatCents(product.priceCents)}
                        </button>
                      </form>
                      {pack && pack.pointsCost > 0 && (
                        <form action={redeemPackWithPoints}>
                          <input type="hidden" name="mysteryPackId" value={pack.id} />
                          <button className="border border-card-border px-4 py-2 rounded-md text-sm font-medium hover:border-brand transition-colors">
                            Redeem for {pack.pointsCost} pts
                          </button>
                        </form>
                      )}
                    </>
                  ) : (
                    <a href="/login" className="text-brand underline text-sm">Sign in to buy</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProductSection({
  title,
  products,
  formatCents,
  loggedIn,
}: {
  title: string;
  products: { id: string; name: string; description: string; priceCents: number; imageEmoji: string }[];
  formatCents: (c: number) => string;
  loggedIn: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border border-card-border bg-card-bg rounded-xl p-5 flex items-center gap-4">
            <div className="text-3xl">{product.imageEmoji}</div>
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm opacity-75">{product.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-medium">{formatCents(product.priceCents)}</span>
              {loggedIn ? (
                <form action={buyProduct} className="flex items-center gap-2">
                  <input type="hidden" name="productId" value={product.id} />
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    defaultValue={1}
                    className="w-14 rounded-md border border-card-border bg-transparent px-2 py-1 text-sm"
                  />
                  <button className="bg-brand text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors">
                    Buy
                  </button>
                </form>
              ) : (
                <a href="/login" className="text-brand underline text-sm">Sign in to buy</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
