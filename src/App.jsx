import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";

import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Category from "./pages/Category";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Purchase from "./pages/Purchase";
import PurchaseDetails from "./pages/PurchaseDetails";
import Sales from "./pages/Sales";
import SalesDetails from "./pages/SalesDetails";
import PriceList from "./pages/PriceList";
import Roles from "./pages/Roles";
import RoleClaims from "./pages/RoleClaims";
import Unauthorized from "./components/pages/Unauthorized";
import Reports from "./pages/Reports";
import BarcodeScanner from "./components/BarcodeScanner";
import UserApprovals from "./pages/UserApprovals";
import ProtectedRoute from "./pages/ProtectedRoute";

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <BarcodeScanner />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin only */}
          <Route
            path="/approvals"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserApprovals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/roles"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Roles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/role-claims"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <RoleClaims />
              </ProtectedRoute>
            }
          />

          {/* All roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "SALES_MANAGER", "PURCHASE_MANAGER"]}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin + Purchase Manager */}
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PURCHASE_MANAGER"]}>
                <Suppliers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PURCHASE_MANAGER"]}>
                <Purchase />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-details"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PURCHASE_MANAGER"]}>
                <PurchaseDetails />
              </ProtectedRoute>
            }
          />

          {/* Admin + Sales Manager */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES_MANAGER"]}>
                <Sales />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales-details"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES_MANAGER"]}>
                <SalesDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES_MANAGER"]}>
                <Customers />
              </ProtectedRoute>
            }
          />

          {/* Shared */}
          <Route
            path="/products"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "PURCHASE_MANAGER", "SALES_MANAGER"]}
              >
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/category"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "PURCHASE_MANAGER", "SALES_MANAGER"]}
              >
                <Category />
              </ProtectedRoute>
            }
          />

          <Route
            path="/price-list"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "PURCHASE_MANAGER", "SALES_MANAGER"]}
              >
                <PriceList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "PURCHASE_MANAGER", "SALES_MANAGER"]}
              >
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}
