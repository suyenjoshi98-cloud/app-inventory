import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardBottom from "../components/DashboardBottom";
import SalesChart from "../components/Charts/SalesChart";
import CustomerChart from "../components/Charts/CustomerChart";
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalExpenses: 0,
    invoiceDue: 0,
    totalProfit: 0,
    totalReturns: 0,
  });

  useEffect(() => {
    const sales = JSON.parse(localStorage.getItem("sales")) || [];
    const totalSales = sales
      .filter((s) => s.status === "Completed")
      .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    const invoiceDue = sales
      .filter((s) => s.status === "Pending")
      .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    const totalReturns = sales
      .filter((s) => s.status === "Cancelled")
      .reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    const totalPurchase = purchases
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    const totalExpenses = purchases.reduce(
      (sum, p) => sum + parseFloat(p.total || 0),
      0,
    );
    const totalProfit = totalSales - totalExpenses;
    setStats({
      totalSales,
      totalPurchase,
      totalExpenses,
      invoiceDue,
      totalProfit,
      totalReturns,
    });
  }, []);

  const fmt = (n) =>
    n < 0
      ? `-Rs${Math.abs(n).toLocaleString()}`
      : `Rs${Number(n).toLocaleString()}`;

  const statCards = [
    {
      label: "Total Sales",
      value: fmt(stats.totalSales),
      change: "From completed sales",
      gradient: "from-blue-500 to-blue-600",
      icon: "📋",
    },
    {
      label: "Total Purchase",
      value: fmt(stats.totalPurchase),
      change: "From completed purchases",
      gradient: "from-violet-500 to-purple-600",
      icon: "🔄",
    },
    {
      label: "Total Expenses",
      value: fmt(stats.totalExpenses),
      change: "All purchase orders",
      gradient: "from-indigo-500 to-indigo-600",
      icon: "💵",
    },
    {
      label: "Invoice Due",
      value: fmt(stats.invoiceDue),
      change: "From pending sales",
      gradient: "from-sky-400 to-cyan-500",
      icon: "📑",
    },
  ];

  const metricCards = [
    {
      value: fmt(stats.totalProfit),
      label: "Total Profit",
      change: stats.totalProfit >= 0 ? "↑ Positive" : "↓ Negative",
      positive: stats.totalProfit >= 0,
      path: "/sales",
    },
    {
      value: fmt(stats.totalReturns),
      label: "Total Payment Returns",
      change: "From cancelled sales",
      positive: false,
      path: "/sales",
    },
    {
      value: fmt(stats.totalExpenses),
      label: "Total Expenses",
      change: "All purchases combined",
      positive: false,
      path: "/purchase",
    },
  ];

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex h-screen bg-[#f5f6fa] font-dm overflow-hidden ">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto px-8 py-7">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-2xl text-indigo-400 font-medium mb-1">
                {greeting()}, {user.name?.split(" ")[0] || "there"} 👋
              </p>
              <h1 className="text-2xl font-bold text-gray-900 font-sora tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Live data from your inventory records
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 text-right shadow-sm">
              <p className="text-lg text-gray-400 font-medium">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {statCards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {metricCards.map((c) => (
              <MetricCard key={c.label} {...c} />
            ))}
          </div>

          {/* Charts */}
          <div className="flex gap-5 flex-wrap mb-5">
            <SalesChart />
            <CustomerChart />
          </div>

          <DashboardBottom />
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, gradient, icon }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl px-5 py-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          {label}
        </p>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold font-sora tracking-tight mb-1">
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        <p className="text-xs text-white/70">{change}</p>
      </div>
    </div>
  );
}

function MetricCard({ value, label, change, positive, path }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[120px]">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 font-sora tracking-tight">
          {value}
        </p>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${positive ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"}`}
        >
          {change}
        </span>
        <button
          onClick={() => path && navigate(path)}
          className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors font-medium"
        >
          View →
        </button>
      </div>
    </div>
  );
}
