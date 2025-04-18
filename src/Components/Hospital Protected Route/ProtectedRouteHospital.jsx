import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRouteHospital = ({ children }) => {
    const detailLogin = localStorage.getItem("login");

    if (!detailLogin) {
      // If no detailLogin, redirect to login
      return <Navigate to="/hospital-login" />;
    }
    
      return children; // Render the protected component
    

};

export default ProtectedRouteHospital;