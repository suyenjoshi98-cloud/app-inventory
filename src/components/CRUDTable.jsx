import { useState } from "react";
import * as XLSX from "xlsx";
import {
  TextInput,
  Button,
  Badge,
  Modal,
  Pagination,
  Text,
  Group,
  Stack,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconSearch, IconEdit, IconTrash } from "@tabler/icons-react";
import useDebounce from "../hooks/useDebounce";
import PropTypes from "prop-types";

export default function CRUDTable({
  title,
  columns,
  storageKey,
  defaultRow,
  selectOptions = {},
}) {
  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  };

  const [rows, setRows] = useState(load);
  const [form, setForm] = useState(defaultRow);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 2;
  const debouncedSearch = useDebounce(search, 300);

  const save = (updated) => {
    setRows(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const exportToExcel = () => {
    const exportData = rows.map((row) => {
      const obj = {};
      columns.forEach((c) => {
        obj[c.label] = row[c.key] || "";
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  const openAdd = () => {
    setForm(defaultRow);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setShowModal(true);
  };

  const handleSubmit = () => {
    const requiredColumns = columns.filter((c) => c.type !== "select");
    const isEmpty = requiredColumns.some(
      (c) => !form[c.key] || String(form[c.key]).trim() === "",
    );
    if (isEmpty) {
      alert("Please fill all required fields.");
      return;
    }
    if (editId !== null && editId !== undefined) {
      save(rows.map((r) => (r.id === editId ? { ...form, id: editId } : r)));
    } else {
      save([...rows, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    save(rows.filter((r) => r.id !== id));
    setDeleteId(null);
  };

  const filtered = rows.filter((r) =>
    columns.some((c) =>
      String(r[c.key] || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <Box>
      {/* Toolbar */}
      <Group justify="space-between" mb="md" wrap="wrap">
        <TextInput
          placeholder={`Search ${title.toLowerCase()}...`}
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          w={260}
          radius="md"
        />
        <button
          className="border border-[#e8533a] text-[#e8533a] text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 hover:bg-red-50"
          onClick={exportToExcel}
          radius="md"
          variant="default"
          style={{ borderColor: "#e8533a", color: "#e8533a" }}
        >
          ⬇ Export Excel
        </button>
        <Button
          onClick={openAdd}
          radius="md"
          style={{ backgroundColor: "#e8533a" }}
        >
          + Add {title.replace(/s$/, "")}
        </Button>
      </Group>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  #
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="text-center py-12 text-gray-300 text-sm"
                  >
                    No {title.toLowerCase()} found. Click "Add" to get started.
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-400 font-medium">
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </td>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className="px-5 py-3.5 text-gray-700 font-medium"
                      >
                        {c.badge ? (
                          <Badge
                            color={getBadgeColor(row[c.key])}
                            variant="light"
                            radius="sm"
                            size="sm"
                          >
                            {row[c.key]}
                          </Badge>
                        ) : (
                          row[c.key] || "—"
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          radius="md"
                          onClick={() => openEdit(row)}
                          title="Edit"
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          radius="md"
                          onClick={() => setDeleteId(row.id)}
                          title="Delete"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <Group
            justify="space-between"
            px="lg"
            py="sm"
            style={{ borderTop: "1px solid #f3f4f6" }}
          >
            <Text size="xs" c="dimmed">
              Showing {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filtered.length)} of{" "}
              {filtered.length} {title.toLowerCase()}
            </Text>
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              size="sm"
              radius="md"
              color="#e8533a"
            />
          </Group>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        opened={showModal}
        onClose={() => setShowModal(false)}
        title={
          <Text fw={700} size="lg">
            {editId
              ? `Edit ${title.replace(/s$/, "")}`
              : `Add ${title.replace(/s$/, "")}`}
          </Text>
        }
        radius="lg"
        centered
        keepMounted={false}
        zIndex={1000}
        overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
      >
        <Stack gap="md">
          {/* ✅ Native HTML inputs — no Mantine Select/TextInput conflict */}
          {columns.map((c) => (
            <div key={c.key}>
              <label className="text-sm font-semibold text-gray-600 block mb-1.5">
                {c.label}
              </label>
              {c.type === "select" ? (
                <select
                  value={form[c.key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [c.key]: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors bg-white"
                >
                  {(selectOptions[c.key] || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={c.type || "text"}
                  value={form[c.key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [c.key]: e.target.value })
                  }
                  placeholder={`Enter ${c.label.toLowerCase()}`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8533a] transition-colors placeholder-gray-300"
                />
              )}
            </div>
          ))}

          <Group grow mt="sm">
            <Button
              variant="default"
              radius="md"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              radius="md"
              style={{ backgroundColor: "#e8533a" }}
              onClick={handleSubmit}
            >
              {editId ? "Update" : "Add"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={
          <Text fw={700} size="lg">
            Delete Item?
          </Text>
        }
        radius="lg"
        centered
        size="sm"
        keepMounted={false}
        zIndex={1000}
        overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
      >
        <Stack align="center" gap="md">
          <Text size="32px">🗑️</Text>
          <Text size="sm" c="dimmed" ta="center">
            This action cannot be undone.
          </Text>
          <Group grow w="100%">
            <Button
              variant="default"
              radius="md"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              radius="md"
              onClick={() => handleDelete(deleteId)}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

function getBadgeColor(value) {
  const v = String(value).toLowerCase();
  if (
    [
      "active",
      "completed",
      "admin",
      "paid",
      "first time",
      "return",
      "vip",
    ].includes(v)
  )
    return "green";
  if (["inactive", "cancelled", "blocked"].includes(v)) return "red";
  if (["pending", "user", "partial"].includes(v)) return "yellow";
  if (["processing", "moderator"].includes(v)) return "blue";
  return "gray";
}

CRUDTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  storageKey: PropTypes.string.isRequired,
  defaultRow: PropTypes.object.isRequired,
  selectOptions: PropTypes.object,
};
