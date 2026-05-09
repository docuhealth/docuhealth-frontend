import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchAppointments } from "../../../queries/Hospital/admin/appointments";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const HosAppointmentsContext = createContext();

const HosAppointmentsProvider = (props) => {

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const pageSize = 7;
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isUserLoggedIn = !!getHospitalToken();

  // Reset to page 1 when search or date filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo]);

  const {
    data, 
    isPending,
    isFetching,
    isError,
    error
  } = useQuery ({
    queryKey : ["hospital-appointments", currentPage, debouncedSearch, dateFrom, dateTo],
    queryFn : fetchAppointments,
    enabled : isUserLoggedIn,
    placeholderData : keepPreviousData,
  })

    useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching appointments");
      console.error(error);
    }
  }, [isError, error]);

  const appointments = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize)

  const value = {
    appointments,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    loading: isPending,    // Initial load spinner
    isRefreshing: isFetching, // Background refresh indicator
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  };

  return (
    <HosAppointmentsContext.Provider
      value={value}
    >
      {props.children}
    </HosAppointmentsContext.Provider>
  );
};

export default HosAppointmentsProvider;