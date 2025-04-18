import React from "react";
import { Navigate } from "react-router-dom";


const UserProtectedRoute = ({ children }) => {
    const detailLogin = localStorage.getItem("userlogin");

    if (!detailLogin) {
      // If no detailLogin, redirect to login
      return <Navigate to="/user-login" />;
    }
    
      return children; // Render the protected component
    

};

export default UserProtectedRoute;