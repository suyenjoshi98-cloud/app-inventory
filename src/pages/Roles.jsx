import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";

const ROLES = {
  ADMIN: "Admin",
  SALES_MANAGER: "Sales Manager",
  PURCHASE_MANAGER: "Purchase Manager",
};

export default function Roles() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(allUsers);
  }, []);

  const filtered = users.filter((u) =>
    [u.name, u.email, u.role].some((v) =>
      String(v || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  // ✅ added
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const getBadgeColor = (role) => {
    if (role === "ADMIN") return "bg-green-100 text-green-600";
    if (role === "SALES_MANAGER") return "bg-blue-100 text-blue-500";
    if (role === "PURCHASE_MANAGER") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-100 text-gray-500";
  };

  const getStatusColor = (status) => {
    if (status === "Active") return "bg-green-100 text-green-600";
    if (status === "Inactive") return "bg-red-100 text-red-500";
    return "bg-gray-100 text-gray-500";
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setShowModal(true);
  };

  const handleSave = () => {
    const updated = users.map((u) =>
      u.email === editUser.email ? editUser : u,
    );
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));

    const loggedIn = JSON.parse(localStorage.getItem("user") || "{}");
    if (loggedIn.email === editUser.email) {
      localStorage.setItem("user", JSON.stringify(editUser));
    }

    setShowModal(false);
    setEditUser(null);
  };

  const handleDelete = (email) => {
    const updated = users.filter((u) => u.email !== email);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  return (
    <PageLayout title="Roles" subtitle="Manage users and their assigned roles">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64 mb-5">
        <span className="text-gray-400 text-sm">🔍</span>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // ✅ reset on search
          }}
          placeholder="Search users..."
          className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["#", "Full Name", "Email", "Role", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? ( // ✅ changed from filtered
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                paginated.map(
                  (
                    user,
                    i, // ✅ changed from filtered
                  ) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-gray-400 font-medium">
                        {(currentPage - 1) * rowsPerPage + i + 1}{" "}
                        {/* ✅ correct number */}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getBadgeColor(user.role)}`}
                        >
                          {ROLES[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(user.status || "Active")}`}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-500 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.email)}
                            className="px-3 py-1.5 bg-red-50 text-[#e8533a] rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filtered.length)} of{" "}
              {filtered.length} users
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ⬅️
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
                ➡️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 font-sora">
              Edit User Role
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Full Name
                </label>
                <input
                  value={editUser.name}
                  disabled
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Email
                </label>
                <input
                  value={editUser.email}
                  disabled
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Role
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="PURCHASE_MANAGER">Purchase Manager</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                  Status
                </label>
                <select
                  value={editUser.status || "Active"}
                  onChange={(e) =>
                    setEditUser({ ...editUser, status: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditUser(null);
                }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-[#e8533a] hover:bg-[#d4472f] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
