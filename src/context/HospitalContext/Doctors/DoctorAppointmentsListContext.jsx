import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchAppointments } from "../../../queries/Hospital/doctor/appointments";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";



export const DoctorAppointmentsListContext = createContext()

const DoctorAppointmentsListProvider = (props) => {

  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentType, setAppointmentType] = useState('today'); // 'today', 'upcoming' or 'history'
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 7;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["doctor-appointments", currentPage, appointmentType, debouncedSearch, dateFrom, dateTo],
    queryFn: fetchAppointments,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
    // The receptionist books/reschedules appointments and check-ins escalate
    // into this list — refresh in the background so the doctor doesn't have
    // to reload. Paused automatically while the tab is backgrounded.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Reset page when switching types or changing search/filters
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
    <DoctorAppointmentsListContext.Provider value={{
      appointments,
      loading: isPending,
      count,
      currentPage,
      setCurrentPage,
      totalPages,
      appointmentType,
      setAppointmentType,
      isRefreshing: isFetching,
      searchQuery,
      setSearchQuery,
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
    }}>
      {props.children}
    </DoctorAppointmentsListContext.Provider>
  )
}

export default DoctorAppointmentsListProvider