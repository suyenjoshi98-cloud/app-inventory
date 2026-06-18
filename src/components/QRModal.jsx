import { useEffect, useRef, useState } from "react";


export default function QRModal({ product, onClose }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

useEffect(() => {
  let approved = false;
  (async () => {
    try {
      const QRcode = (await create("qrcode"));
      if(approved || !canvasRef.current, qrData, {
        width: 220, margin: 2, color: {dark: "#1a1a2e", light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      if(!approved) setReady(true); 
    }catch (e) {
      if(!approved)
        setError("Could not approve your scan please check your intenet connection.")
    };
  });
})

  // QR data — encode key product fields as JSON
  const qrData = JSON.stringify({
    sku: product.sku || "",
    name: product.name || "",
    price: product.price || "",
    category: product.category || "",
    supplier: product.supplier || "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        if (cancelled || !canvasRef.current) return;
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: 220,
          margin: 2,
          color: { dark: "#1a1a2e", light: "#ffffff" },
          errorCorrectionLevel: "H",
        });
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled)
          setError("Could not generate QR. Run: npm install qrcode");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qrData]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>QR Label — ${product.name}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: monospace; background: white; }
            img { width: 200px; height: 200px; }
            .name { font-size: 14px; font-weight: bold; margin-top: 8px; text-align: center; max-width: 200px; }
            .sku  { font-size: 11px; color: #666; margin-top: 2px; }
            .price{ font-size: 13px; font-weight: bold; color: #e8533a; margin-top: 4px; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <div class="name">${product.name}</div>
          <div class="sku">SKU: ${product.sku || "—"}</div>
          <div class="price">NPR ${product.price || "—"}</div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `QR-${product.sku || product.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                QR Code
              </p>
              <p className="text-base font-bold text-gray-900 mt-0.5 truncate max-w-[220px]">
                {product.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center px-6 py-6">
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-inner mb-4">
            {error ? (
              <div className="w-[220px] h-[220px] flex items-center justify-center text-center px-4">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className={ready ? "rounded-xl" : "opacity-0"}
              />
            )}
          </div>

          {/* Product info under QR */}
          <div className="w-full bg-gray-50 rounded-2xl px-4 py-3 space-y-1.5 mb-5">
            {[
              ["SKU", product.sku],
              ["Price", product.price ? `NPR ${product.price}` : null],
              ["Category", product.category],
              ["Supplier", product.supplier],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="text-gray-700 font-semibold">{value}</span>
                </div>
              ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleDownload}
              disabled={!ready}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ⬇ Download
            </button>
            <button
              onClick={handlePrint}
              disabled={!ready}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #e8533a, #f59e0b)",
              }}
            >
              🖨 Print Label
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
