import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";
import { fetchPatientDrugRecords } from "../../queries/Patient/patientDrugRecords";
import { useQuery, keepPreviousData } from "@tanstack/react-query";


export const DrugRecordsContext = createContext();

const DrugRecordsProvider = (props) => {

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // ✅ 6 per page

  const isUserLoggedIn = !!getToken();

  const {
    data,
    isPending,
    isFetching,
    isError,
    error

  } = useQuery({
    queryKey : ["drugRecords", currentPage, pageSize],
    queryFn: fetchPatientDrugRecords,
    enabled : isUserLoggedIn,
    placeholderData : keepPreviousData,
  })

   // Handle errors via useEffect since onError was removed from useQuery v5
  useEffect(() => {
    if (isError) {
      toast.error("Error fetching drug records");
      console.error(error);
    }
  }, [isError, error]);

  const drugRecords = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <DrugRecordsContext.Provider
      value={{
        drugRecords,
        isPending,
        isFetching,
        error,
        isError,
        count,
        totalPages,
        currentPage,
        setCurrentPage
      }}
    >
      {props.children}
    </DrugRecordsContext.Provider>
  );
};

export default DrugRecordsProvider;