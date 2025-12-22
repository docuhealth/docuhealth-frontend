import { Navigate } from "react-router-dom";
import { getHospitalToken } from "../../services/authService";

function HospitalProtectedRoute({ children }) {
  const token = getHospitalToken();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

  return children;
}
export default HospitalProtectedRoute;