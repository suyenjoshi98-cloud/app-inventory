import { useNavigate, useLocation } from "react-router-dom";
import { navSections, accountItems } from "../data/dashboardData";

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  if (!isOpen) return null;

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col py-6 shrink-0 overflow-y-auto shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pb-6 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl ">
          <span className="text-white font-bold text-sm font-sora">SM</span>
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900 font-sora tracking-tight">
            StockMaster
          </p>
          <p className="text-[10px] text-gray-400 tracking-wide">
            Inventory Management
          </p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-1 mt-4">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(userRole),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-2">
              <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest px-3 py-2">
                {section.title}
              </p>
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 cursor-pointer transition-all
                      ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm border border-indigo-100"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-normal"
                      }`}
                  >
                    <span
                      className={`text-base ${isActive ? "text-[#e8533a]" : "text-gray-400"}`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Account */}
        <div className="mt-1">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest px-3 py-2">
            Account
          </p>
          {accountItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 mb-0.5 cursor-pointer transition-all"
            >
              <span className="text-base text-gray-400">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* User card at bottom */}
      <div className="mt-auto mx-4 px-3 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8533a] to-amber-400 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">
            {user.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?"}
          </span>
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-gray-800 truncate">
            {user.name || "User"}
          </p>
          <p className="text-[10px] text-gray-400 truncate">
            {user.role || ""}
          </p>
        </div>
      </div>
    </aside>
  );
}
