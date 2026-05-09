import React, { useState, createContext, useEffect } from "react";
import { getToken } from "../../services/authService";
import { fetchPatientAppointments } from "../../queries/Patient/patientAppointments";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export const AppointmentsContext = createContext();

const AppointmentsProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 7;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getToken();

  const { data, isFetching, isPending, isError, error } = useQuery({
    queryKey: ["appointments", currentPage, pageSize, debouncedSearch, dateFrom, dateTo],
    queryFn: fetchPatientAppointments,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo]);

  useEffect(() => {
    if (isError) {
      toast.error("Error fetching appointments");
      console.error(error);
    }
  }, [isError, error]);

  const appointments = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        isPending,
        isFetching,
        isError,
        count,
        currentPage,
        totalPages,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export default AppointmentsProvider;