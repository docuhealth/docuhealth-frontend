import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";
import { fetchPatientDrugRecords } from "../../queries/Patient/patientDrugRecords";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";

export const DrugRecordsContext = createContext();

const DrugRecordsProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["drugRecords", currentPage, pageSize, debouncedSearch],
    queryFn: fetchPatientDrugRecords,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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
        setCurrentPage,
        searchQuery,
        setSearchQuery,
      }}
    >
      {props.children}
    </DrugRecordsContext.Provider>
  );
};

export default DrugRecordsProvider;