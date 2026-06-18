import React, { useState, useRef, useEffect } from "react";
import {
  useNotifications,
  NOTIFICATION_TYPES,
} from "../context/NotificationContext";

const TYPE_CONFIG = {
  [NOTIFICATION_TYPES.LOW_STOCK]: {
    icon: "⚠️",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  [NOTIFICATION_TYPES.NEW_SALE]: {
    icon: "💰",
    bg: "bg-green-50",
    text: "text-green-600",
  },
  [NOTIFICATION_TYPES.PAYMENT_DUE]: {
    icon: "📄",
    bg: "bg-red-50",
    text: "text-red-600",
  },
  [NOTIFICATION_TYPES.PURCHASE_RECEIVED]: {
    icon: "📦",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  [NOTIFICATION_TYPES.SYSTEM]: {
    icon: "🔔",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const ref = useRef(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const displayed =
    tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-lg border transition-all duration-150
          ${
            open
              ? "bg-orange-50 border-orange-200 text-orange-500"
              : "bg-transparent border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        aria-label={`${unreadCount} unread notifications`}
      >
        {/* Bell SVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Red badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1
            bg-red-500 text-white text-[10px] font-bold rounded-full
            flex items-center justify-center border-2 border-white z-10"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Pulse ring */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px]
            bg-red-400 rounded-full opacity-40 animate-ping pointer-events-none"
          />
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white
          border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-800">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  className="bg-red-50 text-red-600 text-[11px] font-semibold
                  px-2 py-0.5 rounded-full"
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4 border-b border-gray-100">
            {["all", "unread"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs py-2 px-1 mr-4 border-b-2 transition-colors
                  ${
                    tab === t
                      ? "border-orange-500 text-orange-500 font-semibold"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                {t === "all" ? "All" : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <span className="text-4xl mb-2">🔔</span>
                <p className="text-sm">
                  {tab === "unread"
                    ? "No unread notifications"
                    : "All caught up!"}
                </p>
              </div>
            ) : (
              displayed.map((n) => {
                const cfg =
                  TYPE_CONFIG[n.type] || TYPE_CONFIG[NOTIFICATION_TYPES.SYSTEM];
                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50
                      cursor-pointer hover:bg-gray-50 transition-colors
                      ${n.read ? "bg-white" : "bg-orange-50/40"}`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center
                      justify-center text-base flex-shrink-0`}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] ${n.read ? "font-normal" : "font-semibold"} text-gray-800`}
                      >
                        {n.title}
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-gray-300 mt-1">
                        {timeAgo(n.time)}
                      </p>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="text-gray-300 hover:text-gray-500 text-lg leading-none flex-shrink-0 mt-0.5"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
