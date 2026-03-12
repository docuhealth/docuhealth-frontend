// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../../services/authService";

function ProtectedRoute({ children }) {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/user-login" replace />;
  }

  if (role !== 'user') {
    return <Navigate to="/dhadmin-home-dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
