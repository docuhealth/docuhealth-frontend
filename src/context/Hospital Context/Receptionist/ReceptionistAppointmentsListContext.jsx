import React, { useEffect, useState, createContext } from "react";
import { fetchAppointments } from "../../../queries/Hospital/receptionist/appointments";
import { getHospitalToken } from "../../../services/authService";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const ReceptionistAppointmentsListContext = createContext();

const ReceptionistAppointmentsListProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["receptionist-appointments", currentPage],
    queryFn: fetchAppointments,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

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
    <ReceptionistAppointmentsListContext.Provider
      value={value}
    >
      {props.children}
    </ReceptionistAppointmentsListContext.Provider>
  );
};

export default ReceptionistAppointmentsListProvider;
