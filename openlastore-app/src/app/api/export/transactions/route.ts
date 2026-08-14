import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";

// QuickBooks-style sales receipt import shape: one row per line item.
export async function GET() {
  const orders = await db.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "Sales Receipt Date",
    "Sales Receipt No",
    "Customer",
    "Customer Email",
    "Product/Service",
    "Category",
    "Qty",
    "Rate",
    "Amount",
    "Tax",
    "Total",
    "Payment Method",
    "Location",
  ];

  const rows = orders.flatMap((order) =>
    order.items.map((item) => [
      order.createdAt.toISOString().slice(0, 10),
      order.id,
      order.user.name,
      order.user.email,
      item.name,
      item.category,
      item.quantity,
      (item.unitPriceCents / 100).toFixed(2),
      (item.totalCents / 100).toFixed(2),
      (order.taxCents / 100).toFixed(2),
      (order.totalCents / 100).toFixed(2),
      order.paymentMethod,
      order.squareLocationId,
    ])
  );

  const csv = toCsv(headers, rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="openlastore-transactions.csv"',
    },
  });
}
