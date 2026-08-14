import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";

// Square-style item library import shape.
export async function GET() {
  const products = await db.product.findMany({ orderBy: { category: "asc" } });

  const headers = [
    "Item Name",
    "SKU",
    "Category",
    "Brand",
    "Price",
    "Description",
    "Enabled",
  ];

  const rows = products.map((p) => [
    p.name,
    p.sku,
    p.category,
    p.brand,
    (p.priceCents / 100).toFixed(2),
    p.description,
    p.active ? "Y" : "N",
  ]);

  const csv = toCsv(headers, rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="openlastore-catalog.csv"',
    },
  });
}
