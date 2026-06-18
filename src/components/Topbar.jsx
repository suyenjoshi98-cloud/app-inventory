import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const pages = ["Dashboard", "Inventory", "Reports", "Docs"];
const pageRoutes = {
  Dashboard: "/dashboard",
  Inventory: "/products",
  Reports: "/reports",
  Docs: "/docs",
};

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getActivePage = () => {
    if (location.pathname.includes("report")) return "Reports";
    if (
      location.pathname.includes("product") ||
      location.pathname.includes("category") ||
      location.pathname.includes("supplier")
    )
      return "Inventory";
    return "Dashboard";
  };

  const [activePage, setActivePage] = useState(getActivePage);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 shrink-0 gap-6">
      {/* Toggle */}
      <button
        onClick={onToggleSidebar}
        className="w-9 h-9 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 rounded-xl transition-colors shrink-0"
      >
        ☰
      </button>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => {
              setActivePage(page);
              navigate(pageRoutes[page]);
            }}
            className={`px-4 py-2 rounded-xl text-sm cursor-pointer transition-all
              ${
                activePage === page
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-gray-500 font-normal hover:bg-gray-50 hover:text-gray-700"
              }`}
          >
            {page}
          </button>
        ))}
      </nav>

      {/* Right — search + bell + avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors">
          <span className="text-sm text-gray-400">🔍</span>
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-gray-600 w-32 placeholder-gray-400"
          />
        </div>

        <NotificationBell />

        {/* Avatar */}
        <div
          onClick={handleLogout}
          title={`Logout (${user.name || ""})`}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8533a] to-amber-400 cursor-pointer shrink-0 hover:opacity-80 transition-opacity flex items-center justify-center shadow-sm"
        >
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
