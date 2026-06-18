import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { X } from "lucide-react";

export default function Sales() {
  const [sales, setSales] = useState(() => {
    return JSON.parse(localStorage.getItem("sales")) || [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [stockAlert, setStockAlert] = useState("");
  const [stockError, setStockError] = useState("");

  const emptyForm = {
    invoiceNo: "",
    customer: "",
    date: "",
    status: "Pending",
    items: [],
  };

  const [form, setForm] = useState(emptyForm);
  const [itemRow, setItemRow] = useState({
    product: "",
    quantity: "",
    unitPrice: "",
    discount: "",
  });

  const getProducts = () => JSON.parse(localStorage.getItem("products")) || [];

  const save = (updated) => {
    setSales(updated);
    localStorage.setItem("sales", JSON.stringify(updated));
  };

  const saveCustomerIfNew = (CustomerName) => {
    if (!CustomerName) return;
    const customers = JSON.parse(localStorage.getItem("customers")) || [];
    const exist = customers.some(
      (c) => c.name.toLowerCase() == CustomerName.toLowerCase(),
    );

    if (!exist) {
      const newCustomer = {
        id: Date.now(),
        name: customerName,
        email: "",
        address: "",
        type: "First Time",
        status: "Active",
      };
      localStorage.setItem(
        "Customers",
        JSON.stringify([...customers, newCustomer]),
      );
    } else {
      const updated = customers.map((c) =>
        c.name.toLowerCase() === CustomerName.toLowerCase() &&
        c.type === "First Time"
          ? { ...c, type: "Return" }
          : c,
      );
      localStorage.setItem("customers", JSON.stringify(updated));
    }
  };

  const calcItemTotal = (item) => {
    const qty = Number.parseFloat(item.quantity || 0);
    const price = Number.parseFloat(item.unitPrice || 0);
    const discount = Number.parseFloat(item.discount || 0);
    return qty * price * (1 - discount / 100);
  };

  const formTotal = form.items.reduce(
    (sum, item) => sum + calcItemTotal(item),
    0,
  );

  const handleProductSelect = (productName) => {
    const products = getProducts();
    const product = products.find((p) => p.name === productName);
    setStockAlert("");
    setStockError("");

    if (product) {
      setItemRow({
        ...itemRow,
        product: productName,
        unitPrice: product.price || ",",
      });

      if (Number.parseInt(product.stock || 0) < 5) {
        setStockAlert(
          `Low stock! Only ${product.stock} unit left for "${productName}"`,
        );
      }
    } else {
      setItemRow({ ...itemRow, product: productName });
    }
  };

  const addItem = () => {
    setStockError("");
    if (!itemRow.product || !itemRow.quantity || !itemRow.unitPrice) return;

    const products = getProducts();
    const product = products.find((p) => p.name === itemRow.product);

    if (product) {
      const alreadyInCart = form.items
        .filter((i) => i.product === itemRow.product)
        .reduce((sum, i) => sum + Number.parseInt(i.quantity || 0), 0);

      const totalQty = alreadyInCart + Number.parseInt(itemRow.quantity || 0);

      if (totalQty > Number.parseInt(product.stock || 0)) {
        setStockError(
          `Not enough stock! Only ${product.stock} units available for "${itemRow.product}"`,
        );
        return;
      }
    }
    setForm({
      ...form,
      items: [...form.items, { ...itemRow, id: Date.now() }],
    });
    setItemRow({ product: "", quantity: "", unitPrice: "", discount: "" });
    setStockAlert("");
  };

  const removeItem = (id) => {
    setForm({ ...form, items: form.items.filter((i) => i.id !== id) });
  };

  const decreaseStock = (items) => {
    const products = getProducts();
    items.forEach((item) => {
      const index = products.findIndex(
        (p) => p.name.toLowerCase() === item.product.toLowerCase(),
      );
      if (index >= 0) {
        products[index].stock = Math.max(
          0,
          Number.parseInt(products[index].stock || 0) -
            Number.parseInt(item.quantity || 0),
        );
      }
    });
    localStorage.setItem("products", JSON.stringify(products));
  };
  const revertStock = (items) => {
    const products = getProducts();
    items.forEach((item) => {
      const index = products.findIndex(
        (p) => p.name.toLowerCase() === item.product.toLowerCase(),
      );
      if (index >= 0) {
        products[index].stock =
          Number.parseInt(products[index].stock || 0) +
          Number.parseInt(item.quantity || 0);
      }
    });
    localStorage.setItem("products", JSON.stringify(products));
  };

  const handleSubmit = () => {
    if (!form.invoiceNo || !form.customer || !form.date) return;
    const entry = { ...form, total: formTotal, id: editId || Date.now() };
    if (editId) {
      const old = sales.find((s) => s.id === editId);
      if (old && old.status === "Completed") revertStock(old.items || []);
      save(sales.map((s) => (s.id === editId ? entry : s)));
    } else {
      save([...sales, entry]);
    }

    if (form.status === "Completed") {
      decreaseStock(form.items);
    }

    saveCustomerIfNew(form.customer);

    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
    setStockAlert("");
    setStockError("");
  };

  const openEdit = (s) => {
    setForm(s);
    setEditId(s.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const s = sales.find((s) => s.id === id);

    if (s && s.status === "Completed") revertStock(s.items || []);
    save(sales.filter((s) => s.id !== id));
    setDeleteId(null);
  };

  const filtered = sales.filter((s) =>
    [s.invoiceNo, s.customer, s.status].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed") return "bg-green-100 text-green-600";
    if (s === "cancelled") return "bg-red-100 text-red-500";
    if (s === "pending") return "bg-yellow-100 text-yellow-600";
    if (s === "processing") return "bg-blue-100 text-blue-500";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <PageLayout title="Sales" subtitle="Manage all sales invoices">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sales..."
            className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setShowModal(true);
            setStockAlert("");
            setStockError("");
          }}
          className="bg-[#e8533a] hover:bg-[#d4472f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <span>＋</span> Add Sale
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
                  "Invoice No",
                  "Customer",
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
                    No sales yet. Click "Add Sale" to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      {s.invoiceNo}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{s.customer}</td>
                    <td className="px-5 py-3.5 text-gray-700">{s.date}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {s.items?.length || 0} items
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      NPR {parseFloat(s.total || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(s.status)}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-500 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="px-3 py-1.5 bg-red-50 text-[#e8533a] rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
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
            Showing {filtered.length} of {sales.length} sales
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5 font-sora">
              {editId ? "Edit Sale" : "Add Sale"}
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Invoice No
                </label>
                <input
                  value={form.invoiceNo}
                  onChange={(e) =>
                    setForm({ ...form, invoiceNo: e.target.value })
                  }
                  placeholder="INV-001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Customer
                </label>
                <input
                  value={form.customer}
                  onChange={(e) =>
                    setForm({ ...form, customer: e.target.value })
                  }
                  placeholder="Customer name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors"
                >
                  {["Pending", "Completed", "Cancelled", "Processing"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* Add Items */}
            <div className="border border-gray-100 rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-gray-700 mb-3">Add Items</p>

              {stockAlert && (
                <div className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs px-3 py-2 rounded-lg mb-3">
                  {stockAlert}
                </div>
              )}

              {stockError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-3">
                  {stockError}
                </div>
              )}

              {/* ✅ Single set of item input fields */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                <select
                  value={itemRow.product}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8533a]"
                >
                  <option value="">Select Product</option>
                  {getProducts().map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  value={itemRow.quantity}
                  onChange={(e) =>
                    setItemRow({ ...itemRow, quantity: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />

                <input
                  type="number"
                  placeholder="Unit Price"
                  value={itemRow.unitPrice}
                  onChange={(e) =>
                    setItemRow({ ...itemRow, unitPrice: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />

                <input
                  type="number"
                  placeholder="Discount %"
                  value={itemRow.discount}
                  onChange={(e) =>
                    setItemRow({ ...itemRow, discount: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8533a] placeholder-gray-300"
                />
              </div>

              {/* ✅ Single Add Item button */}
              <button
                onClick={addItem}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                ＋ Add Item
              </button>

              {/* Items List */}
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
                        {item.product}
                      </span>
                      <span className="text-gray-500">
                        {item.quantity} × NPR {item.unitPrice}
                      </span>
                      <span className="text-gray-500">
                        {item.discount || 0}%
                      </span>
                      <div className="flex items-center justify-between">
                        {" "}
                        {/* ✅ justify-between */}
                        <span className="font-semibold text-gray-800">
                          NPR {calcItemTotal(item).toLocaleString()}{" "}
                          {/* ✅ correct function name */}
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

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(emptyForm);
                  setEditId(null);
                }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {editId ? "Update" : "Save Sale"}
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
              Delete Sale?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              This will also remove all its items.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
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
