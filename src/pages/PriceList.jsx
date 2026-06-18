import PageLayout from "../components/PageLayout";
import CRUDTable from "../components/CRUDTable";

const columns = [
  { key: "product", label: "Product" },
  { key: "category", label: "Category", type: "select" },
  { key: "costPrice", label: "Cost Price ($)", type: "number" },
  { key: "sellingPrice", label: "Selling Price ($)", type: "number" },
  { key: "discount", label: "Discount (%)", type: "number" },
  { key: "effectiveDate", label: "Effective Date", type: "date" },
];
const defaultRow = {
  product: "",
  category: "",
  costPrice: "",
  sellingPrice: "",
  discount: "",
  effectiveDate: "",
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
};

export default function PriceList() {
  const categories = JSON.parse(localStorage.getItem("category") || "[]").map(
    (c) => c.name,
  );

  const selectOptions = {
    category:
      categories.length > 0
        ? categories
        : [
            "Electronics",
            "Accessories",
            "Computers",
            "Audio",
            "Tablets",
            "Wearables",
            "Other",
          ],
  };
  return (
    <PageLayout
      title="Product Price List"
      subtitle="Manage pricing for all products"
    >
      <CRUDTable
        title="Price Lists"
        columns={columns}
        storageKey="priceList"
        defaultRow={defaultRow}
        selectOptions={selectOptions}
      />
    </PageLayout>
  );
}
