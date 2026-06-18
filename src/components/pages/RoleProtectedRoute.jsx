import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowRoles = [] }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) return <Navigate to="/login" />;

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    return <Navigate to="/login" />;
  }

  if (!user) return <Navigate to="/login" />;

  // ✅ role is now always a string e.g "ADMIN"
  const userRole = user.role;

  if (!userRole) return <Navigate to="/unauthorized" />;

  // ✅ check if user's role is in the allowed roles list
  const hasAccess = allowRoles.includes(userRole);

  if (!hasAccess) return <Navigate to="/unauthorized" />;

  return children;
}
