import PageLayout from "../components/PageLayout";
import CRUDTable from "../components/CRUDTable";

const columns = [
  { key: "name", label: "Full Name" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "type", label: "Type", type: "select", badge: true },
  { key: "status", label: "Status", type: "select", badge: true },
];
const defaultRow = {
  name: "",
  email: "",
  phone: "",
  address: "",
  type: "First Time",
  status: "Active",
};
const selectOptions = {
  type: ["First Time", "Return", "VIP"],
  status: ["Active", "Inactive", "Blocked"],
};

export default function Customers() {
  return (
    <PageLayout title = "Customers" subtitle = "Manages your customer base">
      <CRUDTable
      title = "Customers"
      columns = {columns}
      storageKey = "customers"
      defaultRow = {defaultRow}
      selectOptions = {selectOptions}     

      ></CRUDTable>
    </PageLayout>
  )
};