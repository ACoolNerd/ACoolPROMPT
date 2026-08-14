import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding OpenLAStore demo data...");

  await db.mysteryPackOpening.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cardInstance.deleteMany();
  await db.cardTemplate.deleteMany();
  await db.mysteryPack.deleteMany();
  await db.product.deleteMany();
  await db.pointsLedgerEntry.deleteMany();
  await db.punchCard.deleteMany();
  await db.subscription.deleteMany();
  await db.eventRsvp.deleteMany();
  await db.event.deleteMany();
  await db.user.deleteMany();

  const keith = await db.user.create({
    data: {
      email: "kzmcpherson@gmail.com",
      name: "Keith McPherson",
      role: "ADMIN",
    },
  });

  const jordan = await db.user.create({
    data: {
      email: "jordan.thebarber@example.com",
      name: "Jordan (The Barber)",
      role: "PROFESSIONAL",
    },
  });

  const ari = await db.user.create({
    data: {
      email: "ari.member@example.com",
      name: "Ari Chen",
      role: "MEMBER",
    },
  });

  // ---- Community events ----
  const inDays = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

  await db.event.create({
    data: {
      hostId: jordan.id,
      title: "Sunday Sound Bath + Herbal Pour",
      description:
        "An intimate, 12-seat wind-down for local service pros: sound bowls, herbal tea pour, and unstructured networking. Proximity over scale.",
      category: "Wellness",
      location: "The OpenLAStore Room, Downtown LA",
      isIntimate: true,
      capacity: 12,
      startsAt: inDays(4),
    },
  });

  await db.event.create({
    data: {
      hostId: jordan.id,
      title: "Small Biz Mixer: Local Service Pros",
      description:
        "Barbers, estheticians, trainers, and tattoo artists trade referrals over drinks. Bring cards, leave with clients.",
      category: "Networking",
      location: "The OpenLAStore Room, Downtown LA",
      isIntimate: true,
      capacity: 20,
      startsAt: inDays(9),
    },
  });

  await db.event.create({
    data: {
      hostId: keith.id,
      title: "ACoolCOLLECTOR Pack Break Night",
      description:
        "Live pack breaks, trade tables, and a first look at new O.P.E.N. Opportunity Pack drops.",
      category: "Collectibles",
      location: "The OpenLAStore Room, Downtown LA",
      isIntimate: false,
      capacity: 40,
      startsAt: inDays(14),
    },
  });

  // ---- Products ----
  const kombucha = await db.product.create({
    data: {
      sku: "DRINK-KOMBUCHA",
      name: "House Kombucha Pour",
      category: "DRINK",
      brand: "OPENLASTORE",
      priceCents: 600,
      description: "Rotating small-batch kombucha, poured to order.",
      imageEmoji: "🍹",
    },
  });

  const juice = await db.product.create({
    data: {
      sku: "DRINK-JUICE",
      name: "Cold-Pressed Juice",
      category: "DRINK",
      brand: "OPENLASTORE",
      priceCents: 700,
      description: "Organic, cold-pressed, juiced same day.",
      imageEmoji: "🧃",
    },
  });

  await db.product.create({
    data: {
      sku: "ITEM-TOTE",
      name: "Community Tote Bag",
      category: "ITEM",
      brand: "OPENLASTORE",
      priceCents: 1800,
      description: "Canvas tote, O.P.E.N. logo.",
      imageEmoji: "👜",
    },
  });

  await db.product.create({
    data: {
      sku: "ITEM-CONSULT",
      name: "Wellness Consult Add-on",
      category: "ITEM",
      brand: "OPENLASTORE",
      priceCents: 2500,
      description: "15-minute add-on consult with a resident practitioner.",
      imageEmoji: "🌿",
    },
  });

  const juiceMysteryProduct = await db.product.create({
    data: {
      sku: "PACK-JUICE-MYSTERY",
      name: "Juice Club Mystery Pack",
      category: "PACK",
      brand: "OPENLASTORE",
      priceCents: 999,
      description:
        "5 drink-themed collectible pulls, including a shot at a Golden Drink Ticket (buy-one-give-one-away, 1 of 10).",
      imageEmoji: "🎁",
    },
  });

  const openOpenProduct = await db.product.create({
    data: {
      sku: "PACK-OPEN-OPEN",
      name: "O.P.E.N. Opportunity Pack",
      category: "PACK",
      brand: "ACOOLCOLLECTOR",
      priceCents: 3999,
      description: "5 premium cards from Keith McPherson's personal collection. Infinite possibilities.",
      imageEmoji: "🃏",
    },
  });

  const juiceMysteryPack = await db.mysteryPack.create({
    data: {
      productId: juiceMysteryProduct.id,
      series: "juice-mystery",
      pointsCost: 300,
      slotTiers: JSON.stringify([
        "GUARANTEED_HIT",
        "STAR",
        "ROOKIE",
        "INSERT_PARALLEL",
        "WILD",
      ]),
    },
  });

  const openOpenPack = await db.mysteryPack.create({
    data: {
      productId: openOpenProduct.id,
      series: "open-open-opportunity",
      pointsCost: 1200,
      slotTiers: JSON.stringify([
        "GUARANTEED_HIT",
        "STAR",
        "ROOKIE",
        "INSERT_PARALLEL",
        "WILD",
      ]),
    },
  });

  // ---- Card templates ----
  const juiceTemplates = [
    { name: "Golden Drink Ticket", tier: "GOLDEN", totalSupply: 10, imageEmoji: "🏆", description: "Redeem for one free drink for a friend. Only 10 ever made." },
    { name: "Barista's Choice", tier: "STAR", totalSupply: null, imageEmoji: "⭐", description: "Star-tier pull from the Juice Club rotation." },
    { name: "First Sip Rookie", tier: "ROOKIE", totalSupply: null, imageEmoji: "🌱", description: "Rookie-tier pull from the Juice Club rotation." },
    { name: "Seasonal Blend Insert", tier: "INSERT_PARALLEL", totalSupply: null, imageEmoji: "🍊", description: "Limited seasonal insert card." },
    { name: "House Blend Common", tier: "GUARANTEED_HIT", totalSupply: null, imageEmoji: "🧉", description: "Guaranteed hit from the house blend line." },
    { name: "Mystery Sip Wild Card", tier: "WILD", totalSupply: null, imageEmoji: "❓", description: "Wild card, could be anything in rotation." },
  ] as const;

  for (const t of juiceTemplates) {
    await db.cardTemplate.create({
      data: {
        name: t.name,
        tier: t.tier,
        brand: "OPENLASTORE",
        series: "juice-mystery",
        imageEmoji: t.imageEmoji,
        description: t.description,
        totalSupply: t.totalSupply,
      },
    });
  }

  const collectorTemplates = [
    { name: "Vault Rookie Card", tier: "GUARANTEED_HIT", totalSupply: null, imageEmoji: "🥇", description: "One high-value card from the collection vault." },
    { name: "Veteran Star Card", tier: "STAR", totalSupply: null, imageEmoji: "⭐", description: "Veteran or superstar player card." },
    { name: "Prospect Rookie Card", tier: "ROOKIE", totalSupply: null, imageEmoji: "🆕", description: "Rookie or prospect card." },
    { name: "Insert / Parallel Card", tier: "INSERT_PARALLEL", totalSupply: null, imageEmoji: "🔷", description: "Insert, parallel, or special edition card." },
    { name: "Collection Rotation Wild Card", tier: "WILD", totalSupply: null, imageEmoji: "🎴", description: "Surprise card from the collection rotation." },
    { name: "1-of-10 Autograph Chase Card", tier: "GOLDEN", totalSupply: 10, imageEmoji: "✍️", description: "Serial-numbered autograph chase card, 1 of 10 ever made." },
  ] as const;

  for (const t of collectorTemplates) {
    await db.cardTemplate.create({
      data: {
        name: t.name,
        tier: t.tier,
        brand: "ACOOLCOLLECTOR",
        series: "open-open-opportunity",
        imageEmoji: t.imageEmoji,
        description: t.description,
        totalSupply: t.totalSupply,
      },
    });
  }

  // ---- Pre-printed physical cards awaiting registration ----
  const goldenDrinkTemplate = await db.cardTemplate.findFirstOrThrow({
    where: { name: "Golden Drink Ticket" },
  });
  for (let i = 1; i <= 10; i++) {
    await db.cardInstance.create({
      data: {
        templateId: goldenDrinkTemplate.id,
        serialNumber: i,
        redeemCode: i <= 7 ? `GOLD-DRINK-${String(i).padStart(4, "0")}` : null,
        ownerId: i > 7 ? null : null,
      },
    });
  }

  const autoTemplate = await db.cardTemplate.findFirstOrThrow({
    where: { name: "1-of-10 Autograph Chase Card" },
  });
  for (let i = 1; i <= 10; i++) {
    await db.cardInstance.create({
      data: {
        templateId: autoTemplate.id,
        serialNumber: i,
        redeemCode: i <= 3 ? `ACC-CHASE-${String(i).padStart(4, "0")}` : null,
      },
    });
  }

  // ---- Demo state for Ari (member) so the profile page has something to show ----
  await db.punchCard.create({
    data: { userId: ari.id, punches: 6, freeRedeemed: 0 },
  });

  await db.pointsLedgerEntry.create({
    data: {
      userId: ari.id,
      delta: 140,
      reason: "PURCHASE",
      note: "Starter balance from past visits",
    },
  });

  await db.subscription.create({
    data: {
      userId: ari.id,
      status: "ACTIVE",
      currentPeriodEnd: inDays(21),
    },
  });

  await db.eventRsvp.create({
    data: {
      eventId: (await db.event.findFirstOrThrow({ where: { title: "Sunday Sound Bath + Herbal Pour" } })).id,
      userId: ari.id,
      status: "GOING",
    },
  });

  console.log("Seed complete.");
  console.log({ kombucha: kombucha.id, juice: juice.id, juiceMysteryPack: juiceMysteryPack.id, openOpenPack: openOpenPack.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
