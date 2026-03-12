import React, { createContext, useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminUsers } from "../../queries/admin/users";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";

export const AdminUsersContext = createContext();

const AdminUsersProvider = ({ children }) => {
  const [selectedRole, setSelectedRole] = useState("patient"); // 'patient' or 'hospital'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // For future filtering
  const pageSize = 10; // Similar to HosStaffsContext pattern

  // Fetch users based on the selected role and page
  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users", selectedRole, currentPage, pageSize],
    queryFn: fetchAdminUsers,
    enabled: !!getToken(),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching users");
      console.error(error);
    }
  }, [isError, error]);

  const users = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const value = {
    selectedRole,
    setSelectedRole,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    count,
    users,
    searchQuery,
    setSearchQuery,
    loading: isPending,
    isRefreshing: isFetching,
  };

  return (
    <AdminUsersContext.Provider value={value}>
      {children}
    </AdminUsersContext.Provider>
  );
};

export default AdminUsersProvider;
