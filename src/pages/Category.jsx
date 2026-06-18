import PageLayout from "../components/PageLayout";
import CRUDTable from "../components/CRUDTable";

const columns = [
  { key: "name", label: "Category Name" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status", type: "select", badge: true },
];
const defaultRow = { name: "", description: "", status: "Active" };
const selectOptions = { status: ["Active", "Inactive"] };

export default function Category() {
  return (
    <PageLayout title="Category" subtitle="Manage product categories">
      <CRUDTable
        title="Categories"
        columns={columns}
        storageKey="categories"
        defaultRow={defaultRow}
        selectOptions={selectOptions}
      />
    </PageLayout>
  );
}
