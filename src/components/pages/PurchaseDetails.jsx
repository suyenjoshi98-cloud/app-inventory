
import PageLayout from "../components/PageLayout";
import { useState, useEffect } from "react";

export default function PurchaseDetails() {
  const [details, setDetails] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    const allItems = [];
    purchases.forEach((p) => {
      (p.items || []).forEach((item) => {
        allItems.push({
          poNumber: p.poNumber,
          supplier: p.supplier,
          date: p.date,
          status: p.status,
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: (
            parseFloat(item.quantity || 0) *
            parseFloat(item.unitPrice || 0) *
            (1 - parseFloat(item.discount || 0) / 100)
          ).toFixed(2),
        });
      });
    });
    setDetails(allItems);
  }, []);

  const filtered = details.filter((d) =>
    [d.poNumber, d.supplier, d.product].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  return (
    <PageLayout
      title="Purchase Details"
      subtitle="Auto generated from purchase orders"
    >
      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64 mb-5">
        <span className="text-gray-400 text-sm">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search details..."
          className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "#",
                  "PO Number",
                  "Supplier",
                  "Date",
                  "Product",
                  "Qty",
                  "Unit Price",
                  "Discount",
                  "Total (NPR)",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No purchase details yet. Add items in the Purchase page
                    first.
                  </td>
                </tr>
              ) : (
                filtered.map((d, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      {d.poNumber}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{d.supplier}</td>
                    <td className="px-5 py-3.5 text-gray-700">{d.date}</td>
                    <td className="px-5 py-3.5 text-gray-700">{d.product}</td>
                    <td className="px-5 py-3.5 text-gray-700">{d.quantity}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      NPR {parseFloat(d.unitPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{d.discount}%</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      NPR {parseFloat(d.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} items from all purchases
          </div>
        )}
      </div>
    </PageLayout>
  );
}
