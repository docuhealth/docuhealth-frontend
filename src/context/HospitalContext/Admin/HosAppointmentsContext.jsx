import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchAppointments } from "../../../queries/Hospital/admin/appointments";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const HosAppointmentsContext = createContext();

const HosAppointmentsProvider = (props) => {

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 7;

  const isUserLoggedIn = !!getHospitalToken();


  const {
    data, 
    isPending,
    isFetching,
    isError,
    error
  } = useQuery ({
    queryKey : ["hospital-appointments", currentPage],
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
    isRefreshing: isFetching // Background refresh indicator
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