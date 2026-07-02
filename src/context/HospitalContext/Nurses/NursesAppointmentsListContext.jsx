import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchAppointments } from "../../../queries/Hospital/nurse/appointments";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const NursesAppointmentsListContext = createContext();

const NursesAppointmentsListProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentType, setAppointmentType] = useState('today'); // 'today', 'upcoming' or 'history'
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 7;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["nurse-appointments", currentPage, appointmentType, debouncedSearch, dateFrom, dateTo],
    queryFn: fetchAppointments,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  // Reset page when switching types or changing filters
  useEffect(() => {
    setCurrentPage(1);
  }, [appointmentType, debouncedSearch, dateFrom, dateTo]);

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
  const totalPages = Math.ceil(count / pageSize)

  return (
    <NursesAppointmentsListContext.Provider
      value={{
        appointments,
        count,
        currentPage,
        setCurrentPage,
        totalPages,
        appointmentType,
        setAppointmentType,
        loading: isPending,
        isRefreshing: isFetching,
        searchQuery,
        setSearchQuery,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
      }}
    >
      {props.children}
    </NursesAppointmentsListContext.Provider>
  );
};

export default NursesAppointmentsListProvider;
