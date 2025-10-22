// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../../services/authService";

function ProtectedRoute({ children }) {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/user-login" replace />;
  }

  return children;
}

export default ProtectedRoute;
