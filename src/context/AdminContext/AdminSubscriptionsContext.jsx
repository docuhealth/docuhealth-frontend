import React, { createContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getToken } from "../../services/authService";
import useDebounce from "../../hooks/useDebounce";
import toast from "react-hot-toast";
import {
  fetchAllAdminPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  fetchSubscribedUsers,
} from "../../queries/admin/subscriptions";

export const AdminSubscriptionsContext = createContext();

const AdminSubscriptionsProvider = ({ children }) => {
  const isAdminLoggedIn = !!getToken();
  const queryClient = useQueryClient();

  // Plans
  const {
    data: plansData,
    isPending: plansLoading,
    isError: plansIsError,
    error: plansError,
  } = useQuery({
    queryKey: ["admin-subscription-plans-all"],
    queryFn: fetchAllAdminPlans,
    enabled: isAdminLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (plansIsError) {
      toast.error(plansError?.response?.data?.message || "Error fetching subscription plans");
      console.error(plansError);
    }
  }, [plansIsError, plansError]);

  // Create Plan Mutation
  const { mutate: createPlan, isPending: isCreating } = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      toast.success("Subscription plan created successfully!");
      queryClient.invalidateQueries(["admin-subscription-plans-all"]);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || "Failed to create plan";
      toast.error(msg);
      console.error(err);
    },
  });

  // Update Plan Mutation
  const { mutate: updatePlan, isPending: isUpdating } = useMutation({
    mutationFn: updateSubscriptionPlan,
    onSuccess: () => {
      toast.success("Subscription plan updated successfully!");
      queryClient.invalidateQueries(["admin-subscription-plans-all"]);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || "Failed to update plan";
      toast.error(msg);
      console.error(err);
    },
  });

  // Subscribed Users
  const [subscribedUsersRole, setSubscribedUsersRole] = useState("hospital");
  const [subscribedUsersPage, setSubscribedUsersPage] = useState(1);
  const [subscribedUsersSearch, setSubscribedUsersSearch] = useState("");
  const subscribedUsersPageSize = 8;

  const debouncedSubscribedSearch = useDebounce(subscribedUsersSearch, 300);

  // Reset page on search or role change
  useEffect(() => {
    setSubscribedUsersPage(1);
  }, [debouncedSubscribedSearch, subscribedUsersRole]);

  const handleSetSubscribedUsersRole = (role) => {
    setSubscribedUsersRole(role);
    setSubscribedUsersPage(1);
    setSubscribedUsersSearch("");
  };

  const {
    data: subscribedUsersData,
    isPending: subscribedUsersLoading,
    isFetching: subscribedUsersFetching,
    isError: subscribedUsersIsError,
    error: subscribedUsersError,
  } = useQuery({
    queryKey: [
      "admin-subscribed-users",
      {
        role: subscribedUsersRole,
        page: subscribedUsersPage,
        pageSize: subscribedUsersPageSize,
        search: debouncedSubscribedSearch,
      },
    ],
    queryFn: fetchSubscribedUsers,
    enabled: isAdminLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (subscribedUsersIsError) {
      toast.error(subscribedUsersError?.response?.data?.message || "Error fetching subscribed users");
      console.error(subscribedUsersError);
    }
  }, [subscribedUsersIsError, subscribedUsersError]);

  const subscribedUsers = subscribedUsersData?.results || [];
  const subscribedUsersCount = subscribedUsersData?.count || 0;
  const subscribedUsersTotalPages = Math.ceil(subscribedUsersCount / subscribedUsersPageSize);

  const value = {
    // Plans
    subscriptionPlans: plansData || [],
    plansLoading,
    createPlan,
    isCreating,
    updatePlan,
    isUpdating,

    // Subscribed users
    subscribedUsers,
    subscribedUsersCount,
    subscribedUsersTotalPages,
    subscribedUsersPage,
    setSubscribedUsersPage,
    subscribedUsersRole,
    setSubscribedUsersRole: handleSetSubscribedUsersRole,
    subscribedUsersSearch,
    setSubscribedUsersSearch,
    subscribedUsersLoading,
    subscribedUsersFetching,
    subscribedUsersPageSize,
  };

  return (
    <AdminSubscriptionsContext.Provider value={value}>
      {children}
    </AdminSubscriptionsContext.Provider>
  );
};

export default AdminSubscriptionsProvider;
