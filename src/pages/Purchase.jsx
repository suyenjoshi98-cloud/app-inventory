import { useState } from "react";
import PageLayout from "../components/PageLayout";

export default function Purchase() {
  const [purchases, setPurchases] = useState(() => {
    return JSON.parse(localStorage.getItem("purchases")) || [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  const emptyForm = {
    poNumber: "",
    supplier: "",
    date: "",
    status: "Pending",
    items: [],
  };

  const emptyItem = {
    product: "",
    sku: "",
    category: "",
    price: "",
    quantity: "",
    unitPrice: "",
    discount: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [itemRow, setItemRow] = useState(emptyItem);

  const [suppliers] = useState(() => {
    return JSON.parse(localStorage.getItem("suppliers")) || [];
  });

  const save = (updated) => {
    setPurchases(updated);
    localStorage.setItem("purchases", JSON.stringify(updated));
  };

  const calcItemTotal = (item) => {
    const qty = parseFloat(item.quantity || 0);
    const price = parseFloat(item.unitPrice || 0);
    const discount = parseFloat(item.discount || 0);
    return qty * price * (1 - discount / 100);
  };

  const formTotal = form.items.reduce(
    (sum, item) => sum + calcItemTotal(item),
    0,
  );

  const addItem = () => {
    if (!itemRow.product || !itemRow.quantity || !itemRow.unitPrice) return;
    setForm({
      ...form,
      items: [...form.items, { ...itemRow, id: Date.now() }],
    });
    setItemRow(emptyItem);
  };

  const removeItem = (id) => {
    setForm({ ...form, items: form.items.filter((i) => i.id !== id) });
  };

  const updateProductStock = (items, supplier) => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const categories = JSON.parse(localStorage.getItem("categories")) || [];

    items.forEach((item) => {
      if (item.category) {
        const categoryExists = categories.find(
          (c) => c.name.toLowerCase() === item.category.toLowerCase(),
        );
        if (!categoryExists) {
          categories.push({
            id: Date.now() + Math.random(),
            name: item.category,
            description: `${item.product} from ${supplier}`,
            status: "Active",
          });
          localStorage.setItem("categories", JSON.stringify(categories));
        }
      }

      const existingIndex = products.findIndex(
        (p) => p.name.toLowerCase() === item.product.toLowerCase(),
      );
      if (existingIndex >= 0) {
        products[existingIndex].stock =
          parseInt(products[existingIndex].stock || 0) +
          parseInt(item.quantity || 0);
      } else {
        products.push({
          id: Date.now() + Math.random(),
          name: item.product,
          sku: item.sku || "",
          category: item.category || "",
          supplier: supplier || "",
          price: item.price || item.unitPrice || "",
          stock: parseInt(item.quantity || 0),
          status: "Active",
        });
      }
    });
    localStorage.setItem("products", JSON.stringify(products));
  };

  const revertProductStock = (items) => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    items.forEach((item) => {
      const existingIndex = products.findIndex(
        (p) => p.name.toLowerCase() === item.product.toLowerCase(),
      );
      if (existingIndex >= 0) {
        products[existingIndex].stock = Math.max(
          0,
          parseInt(products[existingIndex].stock || 0) -
            parseInt(item.quantity || 0),
        );
      }
    });
    localStorage.setItem("products", JSON.stringify(products));
  };

  const handleSubmit = () => {
    let finalSupplier = form.supplier;

    if (form.supplier === "_new_") {
      if (!form.supplierName?.trim()) {
        alert("Please enter supplier name");
        return;
      }
      finalSupplier = form.supplierName;

      const allSuppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
      const exists = allSuppliers.find(
        (s) => (s.name || s).toLowerCase() === finalSupplier.toLowerCase(),
      );

      if (!exists) {
        allSuppliers.push({
          id: Date.now(),
          name: finalSupplier,
          contact: "",
          email: "",
          phone: "",
          address: "",
          status: "Active",
        });
        localStorage.setItem("suppliers", JSON.stringify(allSuppliers)); // ✅ fixed comma
      }
    } // ✅ closed if block here

    if (!form.poNumber || !finalSupplier || !form.date) return;

    const entry = {
      ...form,
      supplier: finalSupplier,
      total: formTotal,
      id: editId || Date.now(),
    };

    if (editId) {
      const old = purchases.find((p) => p.id === editId);
      if (old) revertProductStock(old.items || []);
      save(purchases.map((p) => (p.id === editId ? entry : p)));
    } else {
      save([...purchases, entry]);
    }

    if (form.status === "Completed") {
      updateProductStock(form.items, finalSupplier);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  }; // ✅ closed handleSubmit here

  const openEdit = (p) => {
    setForm(p);
    setEditId(p.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const p = purchases.find((p) => p.id === id);
    if (p && p.status === "Completed") revertProductStock(p.items || []);
    save(purchases.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const exportToExcel = () => {
    const headers = [
      "PO Number",
      "Supplier",
      "Date",
      "Items",
      "Total (NPR)",
      "Status",
    ];
    const rows = purchases.map((p) => [
      p.poNumber,
      p.supplier,
      p.date,
      p.items?.length || 0,
      parseFloat(p.total || 0).toFixed(2),
      p.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "purchases.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-600";
    if (s === "cancelled") return "bg-red-100 text-red-500";
    if (s === "pending") return "bg-yellow-100 text-yellow-600";
    if (s === "partial") return "bg-blue-100 text-blue-500";
    return "bg-gray-100 text-gray-500";
  };

  const itemFields = [
    { placeholder: "Product name", key: "product" },
    { placeholder: "SKU", key: "sku" },
    { placeholder: "Category", key: "category" },
    { placeholder: "Selling Price", key: "price", type: "number" },
    { placeholder: "Qty", key: "quantity", type: "number" },
    { placeholder: "Unit Price", key: "unitPrice", type: "number" },
    { placeholder: "Discount %", key: "discount", type: "number" },
  ];

  const filtered = purchases.filter((p) =>
    [p.poNumber, p.supplier, p.status].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <PageLayout title="Purchase" subtitle="Track all purchase orders">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search purchases..."
            className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="border border-[#e8533a] text-[#e8533a] text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 hover:bg-red-50"
          >
            ⬇ Export Excel
          </button>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setShowModal(true);
          }}
          className="bg-[#e8533a] hover:bg-[#d4472f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <span>＋</span> Add Purchase
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "#",
                  "PO Number",
                  "Supplier",
                  "Date",
                  "Items",
                  "Total (NPR)",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No purchases yet. Click "Add Purchase" to get started.
                  </td>
                </tr>
              ) : (
                paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-400">
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      {p.poNumber}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{p.supplier}</td>
                    <td className="px-5 py-3.5 text-gray-700">{p.date}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {p.items?.length || 0} items
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      NPR {parseFloat(p.total || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-500 rounded-lg text-xs font-semibold hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="px-3 py-1.5 bg-red-50 text-[#e8533a] rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filtered.length)} of{" "}
              {filtered.length} purchases
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                      page === currentPage
                        ? "bg-[#e8533a] text-white border-[#e8533a]"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5 font-sora">
              {editId ? "Edit Purchase" : "Add Purchase"}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  PO Number
                </label>
                <input
                  value={form.poNumber}
                  onChange={(e) =>
                    setForm({ ...form, poNumber: e.target.value })
                  }
                  placeholder="PO-001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Supplier
                </label>
                <select
                  value={form.supplier}
                  onChange={(e) =>
                    setForm({ ...form, supplier: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a]"
                >
                  <option value="">Select the supplier</option>
                  {suppliers.map((s, index) => (
                    <option
                      key={s.id || index}
                      value={s.name || s.supplierName || s.company || s}
                    >
                      {s.name || s.supplierName || s.company || s}
                    </option>
                  ))}
                  <option value="_new_">+ Add New Supplier</option>
                </select>
                {form.supplier === "_new_" && (
                  <input
                    type="text"
                    placeholder="Enter supplier name"
                    value={form.supplierName || ""}
                    onChange={(e) =>
                      setForm({ ...form, supplierName: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] mt-2 placeholder-gray-300"
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a]"
                >
                  {["Pending", "Completed", "Cancelled", "Partial"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-gray-700 mb-3">Add Items</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {itemFields.map((f) => (
                  <input
                    key={f.key}
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={itemRow[f.key]}
                    onChange={(e) =>
                      setItemRow({ ...itemRow, [f.key]: e.target.value })
                    }
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                  />
                ))}
              </div>
              <button
                onClick={addItem}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                ＋ Add Item
              </button>

              {form.items.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-400 uppercase px-1">
                    <span className="col-span-2">Product</span>
                    <span>Qty × Price</span>
                    <span>Discount</span>
                    <span>Total</span>
                  </div>
                  {form.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-5 gap-2 items-center bg-gray-50 rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="col-span-2 font-medium text-gray-700 truncate">
                        {item.product}{" "}
                        {item.sku && (
                          <span className="text-gray-400 text-xs">
                            ({item.sku})
                          </span>
                        )}
                      </span>
                      <span className="text-gray-500">
                        {item.quantity} × NPR {item.unitPrice}
                      </span>
                      <span className="text-gray-500">
                        {item.discount || 0}%
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">
                          NPR {calcItemTotal(item).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-xs ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <p className="text-sm font-bold text-gray-900">
                      Total: NPR {formTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-4">
              ⚠️ Stock will only be updated when status is set to{" "}
              <strong>Completed</strong>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(emptyForm);
                  setEditId(null);
                }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm"
              >
                {editId ? "Update" : "Save Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 font-sora">
              Delete Purchase?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              This will also revert the stock changes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
