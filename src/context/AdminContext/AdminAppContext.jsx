import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getToken, getRole } from "../../services/authService";
import axiosInstanceAdmin from "../../utils/axiosInstanceAdmin";

export const AdminAppContext = createContext();

export const useAdminApp = () => useContext(AdminAppContext);

const AdminAppProvider = ({ children }) => {
  const token = getToken();
  const role = getRole();
  const isAuthenticated = !!token && role === "dhadmin";

  const { data: adminInfo, isPending: loadingInfo } = useQuery({
    queryKey: ["admin-info"],
    queryFn: async () => {
      // If there's no specific profile endpoint, we might just return the role
      // Or we can try to fetch from a generic profile endpoint
      try {
        const res = await axiosInstanceAdmin.get("api/auth/user");
        return res.data;
      } catch (error) {
        return { role };
      }
    },
    enabled: isAuthenticated,
  });

  return (
    <AdminAppContext.Provider value={{ adminInfo, loadingInfo, isAuthenticated }}>
      {children}
    </AdminAppContext.Provider>
  );
};

export default AdminAppProvider;
