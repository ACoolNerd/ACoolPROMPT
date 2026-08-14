import Link from "next/link";
import { db } from "@/lib/db";

const TIER_LABEL: Record<string, string> = {
  GUARANTEED_HIT: "Guaranteed Hit",
  STAR: "Star",
  ROOKIE: "Rookie",
  INSERT_PARALLEL: "Insert / Parallel",
  WILD: "Wild Card",
  GOLDEN: "★ GOLDEN ★",
};

export default async function RevealPage({
  params,
}: {
  params: Promise<{ openingId: string }>;
}) {
  const { openingId } = await params;
  const opening = await db.mysteryPackOpening.findUniqueOrThrow({
    where: { id: openingId },
    include: { mysteryPack: { include: { product: true } } },
  });

  const ids: string[] = JSON.parse(opening.cardInstanceIds);
  const cards = await db.cardInstance.findMany({
    where: { id: { in: ids } },
    include: { template: true },
  });
  const ordered = ids.map((id) => cards.find((c) => c.id === id)!);

  return (
    <div className="space-y-8 text-center">
      <div>
        <p className="uppercase text-xs tracking-widest text-brand font-semibold">
          {opening.mysteryPack.product.name}
        </p>
        <h1 className="text-3xl font-bold mt-1">Your pull</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {ordered.map((card) => (
          <div
            key={card.id}
            className={`border rounded-xl p-4 flex flex-col items-center gap-2 bg-card-bg ${
              card.template.tier === "GOLDEN" ? "border-gold shadow-lg shadow-gold/20" : "border-card-border"
            }`}
          >
            <div className="text-4xl">{card.template.imageEmoji}</div>
            <div className="text-xs uppercase tracking-wide opacity-60">
              {TIER_LABEL[card.template.tier]}
            </div>
            <div className="font-semibold text-sm">{card.template.name}</div>
            {card.serialNumber && card.template.totalSupply && (
              <div className="text-xs text-gold font-medium">
                #{card.serialNumber} of {card.template.totalSupply}
              </div>
            )}
          </div>
        ))}
      </div>

      {ordered.some((c) => c.template.tier === "GOLDEN") && (
        <p className="text-gold font-medium">
          You pulled a GOLDEN card! Check your profile for details on redeeming it.
        </p>
      )}

      <div className="flex gap-3 justify-center">
        <Link href="/profile" className="bg-brand text-white px-5 py-2.5 rounded-md font-medium hover:bg-brand-dark transition-colors">
          View your collection
        </Link>
        <Link href="/store" className="border border-card-border px-5 py-2.5 rounded-md font-medium hover:border-brand transition-colors">
          Back to store
        </Link>
      </div>
    </div>
  );
}
