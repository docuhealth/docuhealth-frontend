import React from "react";
import AdminAppProvider from "../../context/AdminContext/AdminAppContext";
import AdminDashboardProvider from "../../context/AdminContext/AdminDashboardContext";
import AdminUsersProvider from "../../context/AdminContext/AdminUsersContext";
import AdminSubscriptionsProvider from "../../context/AdminContext/AdminSubscriptionsContext";

const AdminProviders = ({ children }) => {
  return (
    <AdminAppProvider>
      <AdminDashboardProvider>
        <AdminUsersProvider>
          <AdminSubscriptionsProvider>
            {children}
          </AdminSubscriptionsProvider>
        </AdminUsersProvider>
      </AdminDashboardProvider>
    </AdminAppProvider>
  );
};

export default AdminProviders;
