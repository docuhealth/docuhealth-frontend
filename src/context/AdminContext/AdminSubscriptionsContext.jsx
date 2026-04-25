import React, { createContext, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstanceAdmin from "../../utils/axiosInstanceAdmin";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";

export const AdminSubscriptionsContext = createContext();

export const fetchAdminPlans = async () => {
  const res = await axiosInstanceAdmin.get("api/subscriptions/plans/role/admin");
  return res.data;
};

const AdminSubscriptionsProvider = ({ children }) => {
  const isAdminLoggedIn = !!getToken();

  const {
    data,
    isPending,
    isError,
    error
  } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: fetchAdminPlans,
    enabled: isAdminLoggedIn,
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching subscription plans");
      console.error(error);
    }
  }, [isError, error]);

  const value = {
    subscriptionPlans: data || [],
    loading: isPending,
  };

  return (
    <AdminSubscriptionsContext.Provider value={value}>
      {children}
    </AdminSubscriptionsContext.Provider>
  );
};

export default AdminSubscriptionsProvider;
