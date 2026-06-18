import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useBarcodeScanner
 * Handles USB/keyboard barcode scanner input (fires rapid keystrokes ending in Enter).
 * Camera scanning is handled directly in the BarcodeScanner component via ZXing.
 *
 * @param {function} onScan - called with the scanned barcode string
 * @param {boolean} active - whether to listen for scans
 */
export function useUSBScanner(onScan, active = true) {
  const buffer = useRef("");
  const lastKeyTime = useRef(0);
  const SCAN_TIMEOUT = 50; // ms between keystrokes — USB scanners are very fast

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      const now = Date.now();

      // If gap between keys is too large, reset buffer (user is typing, not scanning)
      if (now - lastKeyTime.current > 300 && buffer.current.length > 0) {
        buffer.current = "";
      }
      lastKeyTime.current = now;

      if (e.key === "Enter") {
        const scanned = buffer.current.trim();
        if (scanned.length >= 3) {
          onScan(scanned);
        }
        buffer.current = "";
        return;
      }

      // Only accumulate printable characters
      if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onScan]);
}

/**
 * Lookup product by barcode/SKU from localStorage
 */
export function lookupProduct(barcode) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  return (
    products.find(
      (p) =>
        (p.sku && p.sku.toLowerCase() === barcode.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase()) ||
        (p.name && p.name.toLowerCase() === barcode.toLowerCase()),
    ) || null
  );
}

/**
 * Update product stock in localStorage
 */
export function updateStock(barcode, delta) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const idx = products.findIndex(
    (p) =>
      (p.sku && p.sku.toLowerCase() === barcode.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase()),
  );
  if (idx === -1) return null;
  products[idx].stock = Math.max(0, parseInt(products[idx].stock || 0) + delta);
  localStorage.setItem("products", JSON.stringify(products));
  return products[idx];
}

