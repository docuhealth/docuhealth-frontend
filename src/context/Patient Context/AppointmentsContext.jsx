import React, { useState, createContext, useEffect } from "react";
import { getToken } from "../../services/authService";
import { fetchPatientAppointments } from "../../queries/Patient/patientAppointments";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const AppointmentsContext = createContext();

const AppointmentsProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const isUserLoggedIn = !!getToken();

  const {
    data,
    isFetching,
    isPending,
    isError,
    error
  } = useQuery({
    queryKey: ["appointments", currentPage, pageSize],
    queryFn: () => fetchPatientAppointments(currentPage, pageSize), // Ensure params are passed
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData, // v5 syntax for smooth pagination
  });

  // Handle errors via useEffect since onError was removed from useQuery v5
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
       }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export default AppointmentsProvider;