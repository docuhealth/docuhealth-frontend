import React, { useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchLabAppointments } from "../../../queries/Hospital/lab/appointments";
import useDebounce from "../../../hooks/useDebounce";

export const LabAppointmentsListContext = createContext();

const LabAppointmentsListProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentType, setAppointmentType] = useState('today'); // 'today', 'upcoming' or 'history'
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 7;

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [appointmentType, debouncedSearch, dateFrom, dateTo]);

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["lab-appointments", appointmentType, currentPage, debouncedSearch, dateFrom, dateTo],
    queryFn: fetchLabAppointments,
    placeholderData: keepPreviousData,
  });

  const appointments = data?.results ?? [];
  const count = data?.count ?? 0;
  const totalPages = Math.ceil(count / pageSize) || 1;

  return (
    <LabAppointmentsListContext.Provider value={{
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
    </LabAppointmentsListContext.Provider>
  );
};

LabAppointmentsListProvider.propTypes = { children: PropTypes.node };

export default LabAppointmentsListProvider;
