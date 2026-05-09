import React, { createContext, useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminUsers } from "../../queries/admin/users";
import { getToken } from "../../services/authService";
import useDebounce from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export const AdminUsersContext = createContext();

const AdminUsersProvider = ({ children }) => {
  const [selectedRole, setSelectedRole] = useState("patient");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Reset page on search or role change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleSetSelectedRole = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users", selectedRole, currentPage, pageSize, debouncedSearch],
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
    setSelectedRole: handleSetSelectedRole,
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
