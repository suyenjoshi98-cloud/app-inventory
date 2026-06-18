import PageLayout from "../components/PageLayout";
import CRUDTable from "../components/CRUDTable";

const columns = [
  { key: "name", label: "Supplier Name" },
  { key: "contact", label: "Contact Person" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "status", label: "Status", type: "select", badge: true },
];
const defaultRow = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  address: "",
  status: "Active",
};
const selectOptions = { status: ["Active", "Inactive"] };

export default function Suppliers() {
  return (
    <PageLayout title="Suppliers" subtitle="Manage your suppliers">
      <CRUDTable
        title="Suppliers"
        columns={columns}
        storageKey="suppliers"
        defaultRow={defaultRow}
        selectOptions={selectOptions}
      />
    </PageLayout>
  );
}
