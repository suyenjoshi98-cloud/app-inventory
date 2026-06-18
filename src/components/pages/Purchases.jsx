import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";

export default function Purchase() {
  const [purchases, setPurchases] = useState(() => {
    return JSON.parse(localStorage.getItem("purchases")) || [];
  });
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
  });

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

  const [from, setForm] =  useState(emptyForm);
  const [itemRow, setItemRow] = useState(emptyItem);

  useEffect (() => {
    const saved = JSON.parse(localStorage.getItem(suppliers)) || [];
    setSuppliers(saved);


  }, []);
  const save = (updated) => {
    setPurchases(updated);
    localStorage.setItem("purchases", JSON.stringify(updated));
  };

  const calcItemsTotal = (item) => {
    const qty = Number.parseFloat(item.quantity || 0);
    const price = Number.parseFloat(item.unitPrice || 0);
    const discount = Number.parseFloat(item.discount || 0);
    return qty * price * (1 - discount / 100);
  };

  // ✅ Add new supplier to localStorage
  const handleAddSupplier = () => {
    if (!newSupplier.name) return;
    const updated = [{ ...newSupplier, id: Date.now() }, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem("suppliers", JSON.stringify(updated));
    setSupplierInput(newSupplier.name);
    setForm({ ...form, supplier: newSupplier.name });
    setNewSupplier({ name: "", contact: "", email: "", address: "" });
    setShowSupplierModal(false);
  };
  const updateProductStock = (items, supplier) => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    items.forEach((item) => {
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
    if (!form.poNumber || !form.supplier || !form.date) return;
    const entry = { ...form, total: formTotal, id: editId || Date.now() };

    if (editId) {
      const old = purchases.find((p) => p.id === editId);
      if (old && old.status === "Completed")
        revertProductStock(old.items || []);
      save(purchases.map((p) => (p.id === editId ? entry : p)));
    } else {
      save([...purchases, entry]);
    }

    if (entry.status === "Completed") {
      updateProductStock(entry.items, entry.supplier);
    }

    setShowModal(false);
    setForm(emptyForm);
    setSupplierInput("");
    setEditId(null);
  };

  const openModal = () => {
    const fresh = JSON.parse(localStorage.getItem("suppliers")) || [];
    setSuppliers(fresh);
    setForm(emptyForm);
    setSupplierInput("");
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    const fresh = JSON.parse(localStorage.getItem("suppliers")) || [];
    setSuppliers(fresh);
    setForm(p);
    setSupplierInput(p.supplier || "");
    setEditId(p.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const p = purchases.find((p) => p.id === id);
    if (p && p.status === "Completed") revertProductStock(p.items || []);
    save(purchases.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const filtered = purchases.filter((p) =>
    [p.poNumber, p.supplier, p.status].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const filteredSuppliers = suppliers.filter((s) =>
    (s.name || "").toLowerCase().includes(supplierInput.toLowerCase()),
  );

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

  return (
    <PageLayout title="Purchase" subtitle="Track all purchase orders">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search purchases..."
            className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
          />
        </div>
        <button
          onClick={openModal}
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No purchases yet. Click "Add Purchase" to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-400">{i + 1}</td>
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
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {purchases.length} purchases
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
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

              {/* ✅ Supplier Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-600">
                    Supplier
                  </label>
                  <button
                    onClick={() => setShowSupplierModal(true)}
                    className="text-xs text-[#e8533a] font-semibold hover:underline"
                  >
                    + New Supplier
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={supplierInput}
                    onChange={(e) => {
                      setSupplierInput(e.target.value);
                      setForm({ ...form, supplier: e.target.value });
                      setShowSupplierDropdown(true);
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSupplierDropdown(false), 150)
                    }
                    placeholder="Select or type supplier..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                  />
                  {showSupplierDropdown && filteredSuppliers.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filteredSuppliers.map((s) => (
                        <div
                          key={s.id}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setSupplierInput(s.name);
                            setForm({ ...form, supplier: s.name });
                            setShowSupplierDropdown(false);
                          }}
                          className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          {s.name}
                          {s.contact && (
                            <span className="text-xs text-gray-400 ml-2">
                              {s.contact}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

            {/* Items */}
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
                  setSupplierInput("");
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

      {/* ✅ Add New Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Add New Supplier
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Name
                </label>
                <input
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  placeholder="Supplier name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Contact
                </label>
                <input
                  value={newSupplier.contact}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, contact: e.target.value })
                  }
                  placeholder="Phone number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Email
                </label>
                <input
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                  placeholder="supplier@gmail.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Address
                </label>
                <input
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                  placeholder="Supplier address"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowSupplierModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSupplier}
                className="flex-1 bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm"
              >
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Delete Purchase?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              This will also revert stock if status was Completed.
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
