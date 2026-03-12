import React from "react";
import AdminAppProvider from "../../context/AdminContext/AdminAppContext";
import AdminDashboardProvider from "../../context/AdminContext/AdminDashboardContext";
import AdminUsersProvider from "../../context/AdminContext/AdminUsersContext";

const AdminProviders = ({ children }) => {
  return (
    <AdminAppProvider>
      <AdminDashboardProvider>
        <AdminUsersProvider>
          {children}
        </AdminUsersProvider>
      </AdminDashboardProvider>
    </AdminAppProvider>
  );
};

export default AdminProviders;
