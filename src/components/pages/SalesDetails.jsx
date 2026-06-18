import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";

export default function SalesDetails() {
  const [details, setDetails] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    
    
    const sales = JSON.parse(localStorage.getItem("sales")) || [];
    const allItems = [];
    sales.forEach((s) => {
      (s.items || []).forEach((item) => {
        allItems.push({
          invoiceNo: s.invoiceNo,
          customer: s.customer,
          date: s.date,
          status: s.status,
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: (
            Number.parseFloat(item.quantity || 0) *
            Number.parseFloat(item.unitPrice || 0) *
            (1 - Number.parseFloat(item.discount || 0) / 100)
          ).toFixed(2),
        });
      });
    });
    setDetails(allItems);
  }, []);

  const filtered = details.filter((d) =>
    [d.invoiceNo, d.customer, d.product].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-600";
    if (s === "cancelled") return "bg-red-100 text-red-500";
    if (s === "pending") return "bg-yellow-100 text-yellow-600";
    if (s === "processing") return "bg-blue-100 text-blue-500";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <PageLayout
      title="Sales Details"
      subtitle="Auto generated from sales invoices"
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
                  "Invoice No",
                  "Customer",
                  "Date",
                  "Product",
                  "Qty",
                  "Unit Price",
                  "Discount",
                  "Total (NPR)",
                  "Status",
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
                    colSpan={10}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No sales details yet. Add items in the Sales page first.
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
                      {d.invoiceNo}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{d.customer}</td>
                    <td className="px-5 py-3.5 text-gray-700">{d.date}</td>
                    <td className="px-5 py-3.5 text-gray-700">{d.product}</td>
                    <td className="px-5 py-3.5 text-gray-700">{d.quantity}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      NPR {Number.parseFloat(d.unitPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{d.discount}%</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      NPR {Number.parseFloat(d.total || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(d.status)}`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} items from all sales
          </div>
        )}
      </div>
    </PageLayout>
  );
}
