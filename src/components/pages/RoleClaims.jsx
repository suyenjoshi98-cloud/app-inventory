import PageLayout from "../components/PageLayout";
import CRUDTable from "../components/CRUDTable";

const columns = [
  { key: "role", label: "Role", type: "select" },
  { key: "claimType", label: "Claim Type" },
  { key: "claimValue", label: "Claim Value" },
  { key: "module", label: "Module", type: "select" },
  { key: "permission", label: "Permission", type: "select", badge: true },
];
const defaultRow = {
  role: "",
  claimType: "",
  claimValue: "",
  module: "",
  permission: "Read",
};
const selectOptions = {
  role: ["Admin", "Moderator", "User"],
  module: [
    "Dashboard",
    "Inventory",
    "Products",
    "Category",
    "Suppliers",
    "Customers",
    "Purchase",
    "Sales",
    "Price List",
    "Roles",
  ],
  permission: ["Read", "Write", "Admin", "Pending"],
};

export default function RoleClaims() {
  return (
    <PageLayout
      title="Role Claims"
      subtitle="Define permissions and claims for each role"
    >
      <CRUDTable
        title="Role Claims"
        columns={columns}
        storageKey="roleClaims"
        defaultRow={defaultRow}
        selectOptions={selectOptions}
      />
    </PageLayout>
  );
}
