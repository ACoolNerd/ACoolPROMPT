import { db } from "@/lib/db";

export default async function ExportPage() {
  const [orderCount, productCount] = await Promise.all([
    db.order.count(),
    db.product.count(),
  ]);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Accounting export</h1>
        <p className="opacity-75">
          Every OpenLAStore and ACoolCOLLECTOR sale is recorded in one ledger.
          Export it in formats that map onto Square (catalog/items) and
          QuickBooks (sales receipts) so bookkeeping stays interoperable
          instead of living in three separate systems.
        </p>
      </div>

      <div className="border border-card-border bg-card-bg rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold">Transactions (QuickBooks-style)</p>
          <p className="text-sm opacity-70">{orderCount} orders recorded</p>
        </div>
        <a
          href="/api/export/transactions"
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Download CSV
        </a>
      </div>

      <div className="border border-card-border bg-card-bg rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold">Catalog (Square-style)</p>
          <p className="text-sm opacity-70">{productCount} items in catalog</p>
        </div>
        <a
          href="/api/export/catalog"
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Download CSV
        </a>
      </div>
    </div>
  );
}
