# OpenLAStore (prototype)

A working prototype for OpenLAStore.com: community/event hosting for local
service professionals, plus a loyalty ecosystem that ties drinks, points,
collectible cards, mystery packs, and a subscription ("Juice Club") together.
Also includes the ACoolCOLLECTOR card-pack line as a second brand sharing the
same loyalty engine.

This is a working demo, not a production deployment: auth is a lightweight
demo login (no passwords), and payments are simulated (no real Square/Stripe
charge). Data is designed to be interoperable with real accounting tools —
see the export routes below.

## Features

- **Community & events** — browse/host intimate, local events; RSVP.
- **Loyalty punch card** — buy 10 drinks, get 1 free, tracked automatically.
- **Points** — every purchase earns points (boosted by a Juice Club subscription).
- **Collectible cards & mystery packs** — open packs with cash or points;
  weighted rarity tiers plus strictly-limited, serial-numbered Golden cards
  (e.g. a "Golden Drink Ticket," 1 of 10 ever made).
- **Physical card registration** — redeem a code from a physical card (given
  out with purchases or at events) into your digital collection.
- **Juice Club subscription** — 1.5x points and a monthly free mystery-pack credit.
- **Accounting export** (`/admin/export`, admin accounts only) — CSV exports
  shaped for Square (catalog) and QuickBooks (sales receipts) so the data
  stays interoperable instead of siloed.

## Getting started

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any email,
or use one of the seeded demo accounts on the login page (including an admin
account that can see `/admin/export`).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Prisma 7 (SQLite via the
`better-sqlite3` driver adapter). Business logic (punch cards, points, pack
odds, card registration) lives in `src/lib/loyalty.ts`; mutations are Server
Actions in `src/lib/actions.ts`.
