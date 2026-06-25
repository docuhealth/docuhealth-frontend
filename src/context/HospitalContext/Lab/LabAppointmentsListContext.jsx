import React, { useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchLabAppointments } from "../../../queries/Hospital/lab/appointments";

export const LabAppointmentsListContext = createContext();

// Maps UI filter labels to API timeframe values
const FILTER_TIMEFRAME_MAP = {
  "All":        "upcoming",
  "Today":      "today",
  "This week":  "upcoming",
  "This month": "history",
};

const LabAppointmentsListProvider = (props) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage]   = useState(1);
  const [searchQuery, setSearchQuery]   = useState("");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");

  const timeframe = FILTER_TIMEFRAME_MAP[activeFilter] ?? "upcoming";

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, dateFrom, dateTo]);

  const { data, isLoading } = useQuery({
    queryKey: ["lab-appointments", timeframe, currentPage, searchQuery, dateFrom, dateTo],
    queryFn:  fetchLabAppointments,
    placeholderData: keepPreviousData,
  });

  const appointments = data?.results ?? [];
  const count        = data?.count ?? 0;
  const totalPages   = Math.max(1, Math.ceil(count / 7));

  return (
    <LabAppointmentsListContext.Provider value={{
      appointments,
      count,
      currentPage,
      setCurrentPage,
      totalPages,
      loading: isLoading,
      searchQuery,
      setSearchQuery,
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
      activeFilter,
      setActiveFilter,
    }}>
      {props.children}
    </LabAppointmentsListContext.Provider>
  );
};

LabAppointmentsListProvider.propTypes = { children: PropTypes.node };

export default LabAppointmentsListProvider;
