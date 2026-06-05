import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchLabAppointments } from "../../../queries/Hospital/lab/appointments";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const LabAppointmentsListContext = createContext();

const LabAppointmentsListProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 7;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["lab-appointments", currentPage, debouncedSearch, dateFrom, dateTo],
    queryFn: fetchLabAppointments,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching appointments");
    }
  }, [isError, error]);

  const appointments = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <LabAppointmentsListContext.Provider value={{
      appointments,
      count,
      currentPage,
      setCurrentPage,
      totalPages,
      loading: isPending,
      isRefreshing: isFetching,
      searchQuery,
      setSearchQuery,
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
    }}>
      {props.children}
    </LabAppointmentsListContext.Provider>
  );
};

export default LabAppointmentsListProvider;
