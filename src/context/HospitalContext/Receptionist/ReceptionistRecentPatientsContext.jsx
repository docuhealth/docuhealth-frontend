import React, { useState, useEffect, createContext } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchRecentPatients } from "../../../queries/Hospital/receptionist/recentPatients";

export const ReceptionistRecentPatientsContext = createContext();

const ReceptionistRecentPatientsProvider = (props) => {

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const isUserLoggedIn = !!getHospitalToken();

  const {
    data,
    isPending,
    isFetching,
     isError,
    error
  } = useQuery({
    queryKey : ["receptionist-recent-patients", currentPage],
    queryFn : fetchRecentPatients,
    enabled : isUserLoggedIn,
    placeholderData : keepPreviousData
  });


    useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching recent patients");
      console.error(error);
    }
  }, [isError, error]);


    const recentPatients = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize)



  return (
    <ReceptionistRecentPatientsContext.Provider
      value={{
        recentPatients,
        loading : isPending,
        count,
        currentPage,
        setCurrentPage,
        totalPages,
      }}
    >
      {props.children}
    </ReceptionistRecentPatientsContext.Provider>
  );
};

export default ReceptionistRecentPatientsProvider;
