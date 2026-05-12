import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../services/authService";
import { fetchStaff } from "../../queries/Hospital/fetchStaff";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export const HosStaffsContext = createContext();

const HosStaffsProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const pageSize = 7;
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isUserLoggedIn = !!getHospitalToken();

  // Reset to page 1 when search or role filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedRole]);

  const {
    data,
    isPending,
    isFetching,
    isError,
    error
  } = useQuery({
    queryKey: ["hospital-staffs", currentPage, debouncedSearch, selectedRole],
    queryFn: fetchStaff,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching staffs");
      console.error(error);
    }
  }, [isError, error]);

  const staffs = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const value = {
    staffs,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    loading: isPending,
    isRefreshing: isFetching,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
  };

  return (
    <HosStaffsContext.Provider value={value}>
      {props.children}
    </HosStaffsContext.Provider>
  );
};

export default HosStaffsProvider;