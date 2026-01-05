import React, { useEffect, useState, createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

import { fetchPatientAppointments } from "../../queries/Patient/patientAppointments";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const AppointmentsContext = createContext();

const AppointmentsProvider = (props) => {

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 7; // Example page size

  const isUserLoggedIn = !!getToken();

  const queryClient = useQueryClient()

  const {
    data,
    isFetching,
    isPending,
    isError,
    error

  } = useQuery(
    {
      queryKey : ["appointments", currentPage, pageSize],
      queryFn : fetchPatientAppointments,
      enabled : isUserLoggedIn,
      keepPreviousData: true,
      onError: () => {
        toast.error("Error fetching appointments");
      },

    }
  )

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
        error,
        count,
        currentPage,
        totalPages,
        setCurrentPage,
       }}
    >
      {props.children}
    </AppointmentsContext.Provider>
  );
};

export default AppointmentsProvider;
