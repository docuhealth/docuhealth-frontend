import React, { useEffect, useState, createContext } from "react";
import { fetchAppointments } from "../../../queries/Hospital/receptionist/appointments";
import { getHospitalToken } from "../../../services/authService";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const ReceptionistAppointmentsListContext = createContext();

const ReceptionistAppointmentsListProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 7;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["receptionist-appointments", currentPage, debouncedSearch, dateFrom, dateTo],
    queryFn: fetchAppointments,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo]);

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message || "Error fetching appointments",
      );
      console.error(error);
    }
  }, [isError, error]);

  const appointments = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const value = {
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
  };

  return (
    <ReceptionistAppointmentsListContext.Provider value={value}>
      {props.children}
    </ReceptionistAppointmentsListContext.Provider>
  );
};

export default ReceptionistAppointmentsListProvider;
