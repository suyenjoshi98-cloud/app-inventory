import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setSales(JSON.parse(localStorage.getItem("sales")) || []);
    setPurchases(JSON.parse(localStorage.getItem("purchases")) || []);
    setProducts(JSON.parse(localStorage.getItem("products")) || []);
    setUsers(JSON.parse(localStorage.getItem("users")) || []);
  }, []);

  // ── Summary Metrics ──────────────────────────────────────────
  const totalRevenue = sales
    .filter((s) => s.status === "Completed")
    .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

  const totalPurchases = purchases
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

  const netProfit = totalRevenue - totalPurchases;

  const lowStockItems = products.filter(
    (p) => parseInt(p.stock || 0) < 5,
  ).length;

  const outOfStock = products.filter(
    (p) => parseInt(p.stock || 0) === 0,
  ).length;

  // ── Sales vs Purchases by Month ───────────────────────────────
  const monthlyData = () => {
    const months = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    sales
      .filter((s) => s.status === "Completed")
      .forEach((s) => {
        if (!s.date) return;
        const m = new Date(s.date).getMonth();
        const key = monthNames[m];
        months[key] = months[key] || { month: key, sales: 0, purchases: 0 };
        months[key].sales += parseFloat(s.total || 0);
      });

    purchases
      .filter((p) => p.status === "Completed")
      .forEach((p) => {
        if (!p.date) return;
        const m = new Date(p.date).getMonth();
        const key = monthNames[m];
        months[key] = months[key] || { month: key, sales: 0, purchases: 0 };
        months[key].purchases += parseFloat(p.total || 0);
      });

    return Object.values(months).sort(
      (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month),
    );
  };

  // ── Stock Level Distribution ──────────────────────────────────
  const inStock = products.filter((p) => parseInt(p.stock || 0) >= 5).length;
  const lowStock = products.filter(
    (p) => parseInt(p.stock || 0) > 0 && parseInt(p.stock || 0) < 5,
  ).length;

  const stockPieData = [
    { name: "In Stock", value: inStock },
    { name: "Low Stock", value: lowStock },
    { name: "Out of Stock", value: outOfStock },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = ["#1D9E75", "#EF9F27", "#E24B4A"];

  // ── Top Products by Stock ─────────────────────────────────────
  const topProducts = [...products]
    .sort((a, b) => parseInt(b.stock || 0) - parseInt(a.stock || 0))
    .slice(0, 5);

  const maxStock = topProducts[0] ? parseInt(topProducts[0].stock || 0) : 1;

  // ── Purchase Orders by Status ─────────────────────────────────
  const purchaseStatuses = ["Completed", "Pending", "Partial", "Cancelled"];
  const purchaseStatusData = purchaseStatuses.map((status) => ({
    status,
    count: purchases.filter((p) => p.status === status).length,
  }));

  // ── Users by Role ─────────────────────────────────────────────
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const salesCount = users.filter((u) => u.role === "SALES_MANAGER").length;
  const purchaseCount = users.filter(
    (u) => u.role === "PURCHASE_MANAGER",
  ).length;

  // ── Sales by Status ───────────────────────────────────────────
  const salesStatusData = [
    "Completed",
    "Pending",
    "Processing",
    "Cancelled",
  ].map((status) => ({
    status,
    count: sales.filter((s) => s.status === status).length,
  }));

  const getStatusBadge = (status) => {
    const map = {
      Completed: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Partial: "bg-blue-100 text-blue-700",
      Processing: "bg-blue-100 text-blue-700",
      Cancelled: "bg-red-100 text-red-600",
    };
    return map[status] || "bg-gray-100 text-gray-500";
  };

  const getStockColor = (stock) => {
    const s = parseInt(stock || 0);
    if (s === 0) return "#E24B4A";
    if (s < 5) return "#EF9F27";
    return "#378ADD";
  };

  return (
    <PageLayout
      title="Reports"
      subtitle="Live insights from your inventory data"
    >
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Revenue",
            value: `NPR ${totalRevenue.toLocaleString()}`,
            sub: "from completed sales",
            color: "text-gray-900",
          },
          {
            label: "Total Purchases",
            value: `NPR ${totalPurchases.toLocaleString()}`,
            sub: "total spent",
            color: "text-gray-900",
          },
          {
            label: "Net Profit",
            value: `NPR ${netProfit.toLocaleString()}`,
            sub: "revenue − purchases",
            color: netProfit >= 0 ? "text-green-600" : "text-red-500",
          },
          {
            label: "Low Stock Items",
            value: lowStockItems,
            sub: "need restocking",
            color: lowStockItems > 0 ? "text-red-500" : "text-green-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
          >
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Sales vs Purchases */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">
            Sales vs Purchases
          </p>
          {monthlyData().length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-10">
              No completed sales or purchases yet.
            </p>
          ) : (
            <>
              <div className="flex gap-4 mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ background: "#378ADD" }}
                  ></span>
                  Sales
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-sm inline-block"
                    style={{ background: "#E24B4A" }}
                  ></span>
                  Purchases
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData()}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(v) => `NPR ${v.toLocaleString()}`} />
                  <Bar dataKey="sales" fill="#378ADD" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="purchases"
                    fill="#E24B4A"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Stock Level Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">
            Stock Level Distribution
          </p>
          {stockPieData.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-10">
              No products added yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {stockPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Top Products by Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">
            Top Products by Stock
          </p>
          {topProducts.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-6">
              No products yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-700 w-32 truncate">{p.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(parseInt(p.stock || 0) / maxStock) * 100}%`,
                        background: getStockColor(p.stock),
                      }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs w-8 text-right">
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Orders by Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">
            Purchase Orders by Status
          </p>
          <div className="space-y-2">
            {purchaseStatusData.map((d) => (
              <div
                key={d.status}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-700">{d.status}</span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-lg ${getStatusBadge(d.status)}`}
                >
                  {d.count} orders
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-sm text-gray-500">
                {purchases.length} orders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sales by Status + Users by Role ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sales by Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">
            Sales by Status
          </p>
          <div className="space-y-2">
            {salesStatusData.map((d) => (
              <div
                key={d.status}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-700">{d.status}</span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-lg ${getStatusBadge(d.status)}`}
                >
                  {d.count} sales
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-sm text-gray-500">
                {sales.length} sales
              </span>
            </div>
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">Users by Role</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Admin",
                count: adminCount,
                color: "bg-purple-50 text-purple-700",
              },
              {
                label: "Sales Manager",
                count: salesCount,
                color: "bg-blue-50 text-blue-700",
              },
              {
                label: "Purchase Manager",
                count: purchaseCount,
                color: "bg-green-50 text-green-700",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-gray-800">{r.count}</p>
                <p className="text-xs text-gray-400 mt-1">{r.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Total users</span>
            <span className="font-bold text-gray-800">{users.length}</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
