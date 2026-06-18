export const salesData = [
  { month: "Jan", sales: 78000, purchase: 42000 },
  { month: "Feb", sales: 95000, purchase: 58000 },
  { month: "Mar", sales: 102000, purchase: 67000 },
  { month: "Apr", sales: 84000, purchase: 51000 },
  { month: "May", sales: 110000, purchase: 73000 },
  { month: "Jun", sales: 107000, purchase: 69000 },
  { month: "Jul", sales: 88000, purchase: 54000 },
  { month: "Aug", sales: 115000, purchase: 78000 },
  { month: "Sep", sales: 93000, purchase: 61000 },
  { month: "Oct", sales: 120000, purchase: 82000 },
  { month: "Nov", sales: 99000, purchase: 65000 },
  { month: "Dec", sales: 108000, purchase: 71000 },
];
 
export const customerData = [
  { name: "First Time", value: 55, color: "#22c55e" },
  { name: "Return", value: 21, color: "#f59e0b" },
  { name: "Other", value: 24, color: "#e5e7eb" },
];
 
export const navSections = [
  {
    title: "Main",
    items: [
      { icon: "⊞", label: "Dashboard", path: "/dashboard", roles: ["ADMIN", "SALES_MANAGER", "PURCHASE_MANAGER"] },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: "🗂️", label: "Products", path: "/products", roles: ["ADMIN", "SALES_MANAGER", "PURCHASE_MANAGER"] },
      { icon: "🏷️", label: "Category", path: "/category", roles: ["ADMIN", "SALES_MANAGER", "PURCHASE_MANAGER"] },
      { icon: "🚚", label: "Suppliers", path: "/suppliers", roles: ["ADMIN", "PURCHASE_MANAGER"] },
      { icon: "👥", label: "Customers", path: "/customers", roles: ["ADMIN", "SALES_MANAGER"] },
    ],
  },
  {
    title: "Transactions",
    items: [
      { icon: "🛒", label: "Purchase", path: "/purchase", roles: ["ADMIN", "PURCHASE_MANAGER"] },
      { icon: "📋", label: "Purchase Details", path: "/purchase-details", roles: ["ADMIN", "PURCHASE_MANAGER"] },
      { icon: "💰", label: "Sales", path: "/sales", roles: ["ADMIN", "SALES_MANAGER"] },
      { icon: "🧾", label: "Sales Details", path: "/sales-details", roles: ["ADMIN", "SALES_MANAGER"] },
      { icon: "💲", label: "Price List", path: "/price-list", roles: ["ADMIN", "SALES_MANAGER", "PURCHASE_MANAGER"] },
    ],
  },
  {
    title: "User & Roles",
    items: [
      { icon: "🛡️", label: "Roles", path: "/roles", roles: ["ADMIN"] },
      { icon: "🔑", label: "Role Claims", path: "/role-claims", roles: ["ADMIN"] },
      { icon: "✅", label: "User Approvals", path: "/approvals", roles: ["ADMIN"] },
    ],
  },
];
 
export const accountItems = [
  { icon: "→", label: "Log in", path: "/login" },
  { icon: "👤", label: "Sign up", path: "/signup" },
];
 