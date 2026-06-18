import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext(null);

export const NOTIFICATION_TYPES = {
  LOW_STOCK: "low_stock",
  NEW_SALE: "new_sale",
  PAYMENT_DUE: "payment_due",
  PURCHASE_RECEIVED: "purchase_received",
  SYSTEM: "system",
};

let nextId = 1;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(({ type, title, message }) => {
    setNotifications((prev) => [
      { id: nextId++, type, title, message, time: new Date(), read: false },
      ...prev,
    ]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside <NotificationProvider>",
    );
  return ctx;
}
