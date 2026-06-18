import PageLayout from "../components/PageLayout";
import CRUDTable from "../components/CRUDTable";

const columns = [
  { key: "roleName", label: "Role Name" },
  { key: "description", label: "Description" },
  { key: "level", label: "Level", type: "select", badge: true },
  { key: "status", label: "Status", type: "select", badge: true },
];
const defaultRow = {
  roleName: "",
  description: "",
  level: "User",
  status: "Active",
};
const selectOptions = {
  level: ["Admin", "Moderator", "User"],
  status: ["Active", "Inactive"],
};

export default function Roles() {
  return (
    <PageLayout title="Roles" subtitle="Manage user roles and access levels">
      <CRUDTable
        title="Roles"
        columns={columns}
        storageKey="roles"
        defaultRow={defaultRow}
        selectOptions={selectOptions}
      />
    </PageLayout>
  );
}
