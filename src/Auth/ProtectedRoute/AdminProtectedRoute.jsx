import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../../services/authService";

function AdminProtectedRoute({ children }) {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/dhadmin-login" replace />;
  }

  if (role !== 'dhadmin') {
    return <Navigate to="/user-home-dashboard" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
