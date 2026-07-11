import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home() {
  const [eventCount, memberCount] = await Promise.all([
    db.event.count(),
    db.user.count(),
  ]);

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 py-8">
        <p className="uppercase tracking-widest text-xs text-brand font-semibold">
          Organic · Personal · Environmental · Necessities
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Open your mind. <span className="text-brand">Open the app.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-80">
          OpenLAStore is a community ecosystem for local service professionals —
          intimate, proximity-first spaces to host events, build relationships,
          and turn everyday visits into an ongoing engagement loop: drinks that
          earn free drinks, purchases that earn points, points that unlock
          collectible cards and mystery packs.
        </p>
        <div className="flex gap-3 justify-center flex-wrap pt-2">
          <Link href="/community" className="bg-brand text-white px-5 py-2.5 rounded-md font-medium hover:bg-brand-dark transition-colors">
            Explore community events
          </Link>
          <Link href="/store" className="border border-card-border px-5 py-2.5 rounded-md font-medium hover:border-brand transition-colors">
            Visit the store
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 text-center">
        <Stat label="Community events hosted" value={eventCount} />
        <Stat label="Members in the ecosystem" value={memberCount} />
        <Stat label="Ways to earn: buy · host · register a card" value="3" />
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        <FeatureCard
          emoji="🤝"
          title="Community connection & event hosting"
          body="Local service professionals — barbers, estheticians, trainers, practitioners — host small, intimate gatherings in proximity to their work. Discover events, RSVP, or host your own."
          href="/community"
          cta="Browse events"
        />
        <FeatureCard
          emoji="🍹"
          title="Buy 10, get 1 free"
          body="Every drink you buy punches your card. Hit 10 and your next one's on the house — tracked automatically on your profile."
          href="/store"
          cta="Shop drinks & items"
        />
        <FeatureCard
          emoji="🃏"
          title="Points, collectibles & mystery packs"
          body="Every purchase earns points. Spend cash or points on mystery packs for a shot at collectible cards — including golden, serial-numbered 1-of-10 chase cards."
          href="/store"
          cta="Open a pack"
        />
        <FeatureCard
          emoji="🎟️"
          title="Register a physical card"
          body="Got a card with a drink purchase or at an event? Register its code to claim it into your digital collection — including limited Golden Drink Tickets, good for a free drink for a friend."
          href="/cards/register"
          cta="Register a card"
        />
      </section>

      <section className="bg-card-bg border border-card-border rounded-2xl p-8 text-center space-y-3">
        <h2 className="text-2xl font-bold">Juice Club subscription</h2>
        <p className="opacity-80 max-w-xl mx-auto">
          Members get a points multiplier on every purchase and a free mystery
          pack credit every month. Cancel anytime.
        </p>
        <Link href="/subscription" className="inline-block bg-gold text-black px-5 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity">
          See Juice Club plans
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-card-border rounded-xl p-5 bg-card-bg">
      <div className="text-3xl font-bold text-brand">{value}</div>
      <div className="text-sm opacity-70 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  body,
  href,
  cta,
}: {
  emoji: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="border border-card-border rounded-xl p-6 bg-card-bg flex flex-col gap-3">
      <div className="text-3xl">{emoji}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm opacity-80 flex-1">{body}</p>
      <Link href={href} className="text-brand font-medium text-sm hover:underline">
        {cta} →
      </Link>
    </div>
  );
}
