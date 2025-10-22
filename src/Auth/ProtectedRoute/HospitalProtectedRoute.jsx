import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../../services/authService";

function HospitalProtectedRoute({ children }) {
  const token = getToken();
  const role = getRole();

    if (!token) {
        return <Navigate to="/hospital-login" replace />;
    }

  return children;
}
export default HospitalProtectedRoute;