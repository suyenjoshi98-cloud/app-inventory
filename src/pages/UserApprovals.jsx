import { useState } from "react";
import PageLayout from "../components/PageLayout";

function Section({ title, list, onApprove, onReject }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
        {title} ({list.length})
      </h2>
      {list.length === 0 ? (
        <p className="text-sm text-gray-300 py-6 text-center bg-white rounded-2xl border border-gray-100">
          None
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-5 py-3.5 font-semibold text-gray-800">
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.role}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        u.status === "active"
                          ? "bg-green-100 text-green-600"
                          : u.status === "rejected"
                            ? "bg-red-100 text-red-500"
                            : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {u.status !== "active" && (
                        <button
                          onClick={() => onApprove(u.id)}
                          className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100"
                        >
                          Approve
                        </button>
                      )}
                      {u.status !== "rejected" && (
                        <button
                          onClick={() => onReject(u.id)}
                          className="px-3 py-1.5 bg-red-50 text-[#e8533a] rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function UserApprovals() {
  const [users, setUsers] = useState(() =>
    JSON.parse(localStorage.getItem("users") || "[]"),
  );

  const updateStatus = (id, status) => {
    const updated = users.map((u) => (u.id === id ? { ...u, status } : u));
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));

    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const updatedRoles = roles.map((r) => {
      const match = updated.find((u) => u.email === r.email);
      return match ? { ...r, status: match.status } : r;
    });
    localStorage.setItem("roles", JSON.stringify(updatedRoles));
  };

  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "active");
  const rejected = users.filter((u) => u.status === "rejected");

  return (
    <PageLayout title="User Approvals" subtitle="Manage user access requests">
      <Section
        title="Pending Approval"
        list={pending}
        onApprove={(id) => updateStatus(id, "active")}
        onReject={(id) => updateStatus(id, "rejected")}
      />
      <Section
        title="Approved Users"
        list={approved}
        onApprove={(id) => updateStatus(id, "active")}
        onReject={(id) => updateStatus(id, "rejected")}
      />
      <Section
        title="Rejected Users"
        list={rejected}
        onApprove={(id) => updateStatus(id, "active")}
        onReject={(id) => updateStatus(id, "rejected")}
      />
    </PageLayout>
  );
}
