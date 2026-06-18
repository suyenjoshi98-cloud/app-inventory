import PageLayout from "../components/PageLayout";
import CRUDTable from "../components/CRUDTable";

const columns = [
  { key: "name", label: "Product Name" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category", type: "select" },
  { key: "supplier", label: "Supplier" },
  { key: "price", label: "Price ($)", type: "number" },
  { key: "stock", label: "Stock", type: "number" },
  { key: "status", label: "Status", type: "select", badge: true },
];
const defaultRow = {
  name: "",
  sku: "",
  category: "",
  supplier: "",
  price: "",
  stock: "",
  status: "Active",
};
const selectOptions = {
  category: [
    "Electronics",
    "Accessories",
    "Computers",
    "Audio",
    "Tablets",
    "Wearables",
    "Other",
  ],
  status: ["Active", "Inactive"],
};

export default function Products() {
  return (
    <PageLayout title="Products" subtitle="Manage your product catalogue">
      <CRUDTable
        title="Products"
        columns={columns}
        storageKey="products"
        defaultRow={defaultRow}
        selectOptions={selectOptions}
      />
    </PageLayout>
  );
}
