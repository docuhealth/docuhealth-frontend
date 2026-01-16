// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../../services/authService";

function PartnerProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/partner-login" replace />;
  }

  return children;
}

export default PartnerProtectedRoute;
