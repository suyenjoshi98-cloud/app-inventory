import { useEffect, useState } from "react";

export default function DashboardBottom() {
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    // Load products for top selling and low stock
    const products = JSON.parse(localStorage.getItem("products")) || [];

    // Low stock = quantity below 10
    const low = products
      .filter((p) => Number.parseInt(p.stock || 0) < 10)
      .sort((a, b) => Number.parseInt(a.stock) - Number.parseInt(b.stock))
      .slice(0, 5);
    setLowStock(low);

    // Top selling = highest price products (since we don't track units sold yet)
    const top = [...products]
      .sort(
        (a, b) =>
          Number.parseFloat(b.price || 0) - Number.parseFloat(a.price || 0),
      )
      .slice(0, 5);
    setTopSelling(top);

    // Recent sales
    const sales = JSON.parse(localStorage.getItem("sales")) || [];
    const recent = [...sales].reverse().slice(0, 5);
    setRecentSales(recent);
  }, []);

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-600";
    if (s === "processing") return "bg-orange-100 text-orange-500";
    if (s === "pending") return "bg-yellow-100 text-yellow-600";
    if (s === "cancelled") return "bg-red-100 text-red-500";
    return "bg-gray-100 text-gray-500";
  };

  const getProductKey = (item, prefix) =>
    `${prefix}-${item.sku || item.id || item.name || "unknown"}`;

  const getSaleKey = (item) =>
    `sale-${item.invoiceNo || item.id || item.customer || "unknown"}`;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-base">Top Products</h2>
            <span className="text-xs text-gray-400">By Price</span>
          </div>
          {topSelling.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">
              No products yet. Add products first.
            </p>
          ) : (
            <div className="space-y-3">
              {topSelling.map((item) => (
                <div
                  key={getProductKey(item, "top")}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-lg">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.category} • {item.stock} units
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#e8533a] shrink-0">
                    Rs{Number.parseFloat(item.price || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-base">
              Low Stock Products
            </h2>
            <span className="text-xs text-[#e8533a] font-semibold">
              Below 10
            </span>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">
              No low stock products 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={getProductKey(item, "low")}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-lg">
                    ⚠️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      SKU: {item.sku || "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-[#e8533a]">
                      {String(item.stock).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] text-gray-400">In Stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-base">Recent Sales</h2>
            <span className="text-xs text-gray-400">Latest 5</span>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">
              No sales yet. Add sales first.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((item) => (
                <div key={getSaleKey(item)} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 text-lg">
                    🧾
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {item.customer || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.invoiceNo} • Rs
                      {Number.parseFloat(item.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 ${getStatusColor(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-8 mb-2 px-4">
        Copyright © 2026 StockMaster Inventory Dashboard. Developed by {"Suyen"}
      </p>
    </div>
  );
}
