import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
    const detailLogin = localStorage.getItem("adminlogin");

    if (!detailLogin) {
      // If no detailLogin, redirect to login
      return <Navigate to="/admin-login" />;
    }
    
      return children; // Render the protected component
    

};

export default AdminProtectedRoute;