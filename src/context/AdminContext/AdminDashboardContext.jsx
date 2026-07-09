import React, { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboardData } from "../../queries/admin/dashboard";
import { getToken, getRole } from "../../services/authService";

export const AdminDashboardContext = createContext();

export const useAdminDashboard = () => useContext(AdminDashboardContext);

const AdminDashboardProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  });

  const token = getToken();
  const role = getRole();
  const isEnabled = !!token && role === "dhadmin";

  const {
    data: dashboardData,
    isPending: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-dashboard", dateRange],
    queryFn: fetchAdminDashboardData,
    enabled: isEnabled,
    staleTime: 1000 * 5,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const updateDateRange = (newRange) => {
    setDateRange((prev) => ({ ...prev, ...newRange }));
  };

  console.log(dashboardData)

  return (
    <AdminDashboardContext.Provider
      value={{
        dashboardData,
        loading,
        error,
        dateRange,
        updateDateRange,
        refetch,
      }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
};

export default AdminDashboardProvider;
