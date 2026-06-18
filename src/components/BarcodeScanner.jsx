import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUSBScanner, lookupProduct, updateStock } from "../hooks/useBarcodeScanner";

// ─── ZXing lazy loader ────────────────────────────────────────────────────────
let zxingReader = null;
async function getZXingReader() {
  if (zxingReader) return zxingReader;
  const { BrowserMultiFormatReader } = await import("@zxing/library");
  zxingReader = new BrowserMultiFormatReader();
  return zxingReader;
}

// ─── Parse scanned value — supports plain SKU or QR JSON ─────────────────────
function parseScanned(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.sku || parsed.name)) {
      return { type: "qr", data: parsed };
    }
  } catch (_) {}
  return { type: "barcode", data: raw.trim() };
}

// ─── Mode config ──────────────────────────────────────────────────────────────
const MODES = [
  { id: "lookup",   label: "Look Up",  icon: "🔍", color: "#6366f1" },
  { id: "sale",     label: "Add Sale", icon: "🧾", color: "#10b981" },
  { id: "purchase", label: "Purchase", icon: "📦", color: "#f59e0b" },
  { id: "stock",    label: "Stock In", icon: "⬆",  color: "#e8533a" },
];

export default function BarcodeScanner() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("lookup");
  const [inputMethod, setInputMethod] = useState("usb");
  const [manualInput, setManualInput] = useState("");
  const [result, setResult] = useState(null);
  const [stockDelta, setStockDelta] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [flash, setFlash] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const handleBarcode = useCallback(
    (raw) => {
      if (!raw || !open) return;
      setFlash(true);
      setTimeout(() => setFlash(false), 400);

      const { type, data } = parseScanned(raw);

      let product = null;

      if (type === "qr") {
        product = lookupProduct(data.sku) || lookupProduct(data.name) || data;
      } else {
        product = lookupProduct(data);
      }

      if (!product) {
        setResult({ barcode: raw, product: null, status: "not_found", type });
        addToRecent(raw, null, type);
        return;
      }

      if (mode === "stock") {
        const identifier = product.sku || product.name;
        const updated = updateStock(identifier, stockDelta) || product;
        setResult({ barcode: raw, product: { ...updated, stock: (parseInt(updated.stock || 0)) }, status: "stock_updated", delta: stockDelta, type });
        addToRecent(raw, product, type);
        return;
      }

      setResult({ barcode: raw, product, status: "found", type, isQR: type === "qr" });
      addToRecent(raw, product, type);
    },
    [open, mode, stockDelta],
  );

  const addToRecent = (barcode, product, type) => {
    setRecentScans((prev) =>
      [{ barcode, product, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5),
    );
  };

  useUSBScanner(handleBarcode, open && inputMethod === "usb");

  useEffect(() => {
    if (!open || inputMethod !== "camera") return;
    let cancelled = false;
    setScanning(true);
    setCameraError("");

    (async () => {
      try {
        const reader = await getZXingReader();
        readerRef.current = reader;
        if (cancelled) return;
        await reader.decodeFromVideoDevice(null, videoRef.current, (res) => {
          if (res && !cancelled) handleBarcode(res.getText());
        });
      } catch (e) {
        if (!cancelled) {
          setCameraError(
            e?.message?.includes("ermission")
              ? "Camera permission denied. Please allow camera access."
              : "Could not start camera. Run: npm install @zxing/library",
          );
          setScanning(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      readerRef.current?.reset();
      setScanning(false);
    };
  }, [open, inputMethod, handleBarcode]);

  useEffect(() => {
    if (!open) {
      readerRef.current?.reset();
      setResult(null);
      setManualInput("");
      setCameraError("");
    }
  }, [open]);

  const handleAddToSale = () => {
    if (!result?.product) return;
    localStorage.setItem("pendingScanProduct", JSON.stringify(result.product));
    navigate("/sales");
    setOpen(false);
  };

  const handleAddToPurchase = () => {
    if (!result?.product) return;
    localStorage.setItem("pendingScanProduct", JSON.stringify(result.product));
    navigate("/purchase");
    setOpen(false);
  };

  const currentMode = MODES.find((m) => m.id === mode);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Barcode / QR Scanner"
        style={{ background: "linear-gradient(135deg, #e8533a, #f59e0b)" }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-white text-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <BarcodeIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div
            className={`relative w-full sm:w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all ${flash ? "ring-4 ring-green-400" : ""}`}
            style={{ maxHeight: "92vh" }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${currentMode.color}15, white)` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${currentMode.color}20`, color: currentMode.color }}>
                    {currentMode.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Barcode & QR Scanner</p>
                    <p className="text-sm font-bold text-gray-800">{currentMode.label} Mode</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm">✕</button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setResult(null); }}
                    className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all"
                    style={mode === m.id ? { background: m.color, color: "white" } : { background: "#f3f4f6", color: "#6b7280" }}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {/* Input toggle */}
              <div className="flex gap-2 mb-4">
                {["usb", "camera"].map((method) => (
                  <button
                    key={method}
                    onClick={() => { setInputMethod(method); setResult(null); setCameraError(""); }}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                    style={
                      inputMethod === method
                        ? { borderColor: currentMode.color, color: currentMode.color, background: `${currentMode.color}10` }
                        : { borderColor: "#e5e7eb", color: "#9ca3af" }
                    }
                  >
                    {method === "usb" ? "⌨️ USB / Manual" : "📷 Camera (QR & Barcode)"}
                  </button>
                ))}
              </div>

              {/* USB mode */}
              {inputMethod === "usb" && (
                <div className="mb-4">
                  <div className="rounded-2xl border-2 border-dashed p-5 text-center mb-3" style={{ borderColor: `${currentMode.color}50`, background: `${currentMode.color}05` }}>
                    <div className="text-3xl mb-2">⌨️</div>
                    <p className="text-sm font-semibold text-gray-700">Ready for USB Scanner</p>
                    <p className="text-xs text-gray-400 mt-1">Reads both barcodes and QR codes</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { handleBarcode(manualInput); setManualInput(""); } }}
                      placeholder="Type SKU or paste QR data..."
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400"
                    />
                    <button
                      onClick={() => { handleBarcode(manualInput); setManualInput(""); }}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: currentMode.color }}
                    >Go</button>
                  </div>
                </div>
              )}

              {/* Camera mode */}
              {inputMethod === "camera" && (
                <div className="mb-4">
                  {cameraError ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                      <p className="text-sm text-red-500">{cameraError}</p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                      <video ref={videoRef} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-white/80 rounded-2xl relative">
                          <span className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-xl" />
                          <span className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-xl" />
                          <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-xl" />
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-white rounded-br-xl" />
                          <div className="absolute left-0 right-0 h-0.5 bg-green-400/80" style={{ animation: "scanline 1.8s ease-in-out infinite" }} />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-semibold">📷 QR & Barcode</div>
                      {scanning && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          Live
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stock delta */}
              {mode === "stock" && (
                <div className="flex items-center gap-3 mb-4 bg-amber-50 rounded-xl px-4 py-3">
                  <span className="text-sm font-semibold text-gray-600">Stock to add:</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button onClick={() => setStockDelta((d) => Math.max(1, d - 1))} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">−</button>
                    <span className="w-8 text-center font-bold text-gray-800">{stockDelta}</span>
                    <button onClick={() => setStockDelta((d) => d + 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">+</button>
                  </div>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="rounded-2xl border p-4 mb-4" style={result.status === "not_found" ? { borderColor: "#fca5a5", background: "#fff5f5" } : { borderColor: `${currentMode.color}40`, background: `${currentMode.color}08` }}>
                  {result.status === "not_found" ? (
                    <div className="text-center">
                      <p className="text-2xl mb-1">❓</p>
                      <p className="text-sm font-bold text-red-500">Product Not Found</p>
                      <p className="text-xs text-gray-400 mt-1">Add it to Products first, then scan again.</p>
                    </div>
                  ) : (
                    <>
                      {result.isQR && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="text-xs bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">⬛ QR Code</span>
                          <span className="text-xs text-gray-400">Full product data decoded</span>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{result.product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">SKU: <span className="font-mono">{result.product.sku || "—"}</span>{result.product.category && ` · ${result.product.category}`}</p>
                        </div>
                        <div className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: `${currentMode.color}20`, color: currentMode.color }}>
                          {result.status === "stock_updated" ? `+${result.delta} added` : "Found ✓"}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[["Price", result.product.price ? `NPR ${result.product.price}` : "—"], ["Stock", result.product.stock ?? "—"], ["Status", result.product.status || "—"]].map(([label, value]) => (
                          <div key={label} className="bg-white rounded-xl p-2 text-center border border-gray-100">
                            <p className="text-xs text-gray-400">{label}</p>
                            <p className={`text-sm font-bold ${label === "Status" && value === "Active" ? "text-green-500" : "text-gray-800"}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                      {(mode === "lookup" || mode === "sale" || mode === "purchase") && (
                        <div className="flex gap-2 mt-3">
                          {(mode === "lookup" || mode === "sale") && (
                            <button onClick={handleAddToSale} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">🧾 Add to Sale</button>
                          )}
                          {(mode === "lookup" || mode === "purchase") && (
                            <button onClick={handleAddToPurchase} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors">📦 Add to Purchase</button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Recent scans */}
              {recentScans.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Scans</p>
                  <div className="space-y-1.5">
                    {recentScans.map((s, i) => (
                      <div key={i} onClick={() => setResult({ barcode: s.barcode, product: s.product, status: s.product ? "found" : "not_found", type: s.type, isQR: s.type === "qr" })} className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 cursor-pointer transition-colors">
                        <span className="text-base">{s.type === "qr" ? "⬛" : "▌▌"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{s.product ? s.product.name : "Not found"}</p>
                          <p className="text-xs text-gray-400">{s.type === "qr" ? "QR Code" : `SKU: ${s.barcode}`}</p>
                        </div>
                        <p className="text-xs text-gray-300 shrink-0">{s.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes scanline { 0% { top: 10%; } 50% { top: 85%; } 100% { top: 10%; } }`}</style>
    </>
  );
}

function BarcodeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5v14" /><path d="M7 5v14" /><path d="M11 5v14" /><path d="M15 5v14" />
      <path d="M19 5v14" /><path d="M3 5h2" /><path d="M3 19h2" /><path d="M19 5h2" /><path d="M19 19h2" />
    </svg>
  );
}