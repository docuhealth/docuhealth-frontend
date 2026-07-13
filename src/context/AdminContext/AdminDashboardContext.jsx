import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboardData } from "../../queries/admin/dashboard";
import { getToken, getRole } from "../../services/authService";

export const AdminDashboardContext = createContext();

export const useAdminDashboard = () => useContext(AdminDashboardContext);

const AdminDashboardProvider = ({ children }) => {
  const token = getToken();
  const role = getRole();
  const isEnabled = !!token && role === "dhadmin";

  const {
    data: dashboardData,
    isPending: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboardData,
    enabled: isEnabled,
    staleTime: 1000 * 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  console.log(dashboardData)

  return (
    <AdminDashboardContext.Provider
      value={{
        dashboardData,
        loading,
        error,
        refetch,
      }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
};

export default AdminDashboardProvider;

