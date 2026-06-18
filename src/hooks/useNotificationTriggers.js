import { useEffect, useRef } from "react";
import {
  useNotifications,
  NOTIFICATION_TYPES,
} from "../context/NotificationContext";

export function useNotificationTriggers({
  products = [],
  sales = [],
  lowStockThreshold = 10,
}) {
  const { addNotification } = useNotifications();
  const notifiedIds = useRef(new Set());
  const prevSalesLen = useRef(sales.length);

  // Low stock watcher
  useEffect(() => {
    products.forEach((p) => {
      if (p.stock <= lowStockThreshold && !notifiedIds.current.has(p.id)) {
        notifiedIds.current.add(p.id);
        addNotification({
          type: NOTIFICATION_TYPES.LOW_STOCK,
          title: "Low Stock Alert",
          message: `${p.name} has only ${p.stock} units left`,
        });
      }
      if (p.stock > lowStockThreshold) {
        notifiedIds.current.delete(p.id); // reset so it re-alerts if drops again
      }
    });
  }, [products, lowStockThreshold, addNotification]);

  // New sale watcher
  useEffect(() => {
    if (sales.length > prevSalesLen.current) {
      const newest = sales[0]; // assumes newest is first
      addNotification({
        type: NOTIFICATION_TYPES.NEW_SALE,
        title: "New Sale Completed",
        message: `${newest?.customerName || "A customer"} placed an order worth Rs${newest?.total?.toLocaleString() || "—"}`,
      });
    }
    prevSalesLen.current = sales.length;
  }, [sales, addNotification]);
}
