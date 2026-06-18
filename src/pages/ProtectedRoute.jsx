import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }
  if (user.status === "pending") {
    return (
      <Navigate
        to="/login"
        state={{ message: "Your account is pending admin approval." }}
      />
    );
  }

  if (user.status === "rejected") {
    return (
      <Navigate
        to="/login"
        state={{ message: "Your account has been rejected." }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
