import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";
import { fetchPatientMedicalRecords } from "../../queries/Patient/patientMedicalRecords";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";

export const MedicalRecordsContext = createContext();

const MedicalRecordsProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["medicalRecords", currentPage, pageSize, debouncedSearch],
    queryFn: fetchPatientMedicalRecords,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error("Error fetching medical records");
      console.error(error);
    }
  }, [isError, error]);

  const medicalRecords = data?.medical_records?.results || [];
  const count = data?.medical_records?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <MedicalRecordsContext.Provider
      value={{
        medicalRecords,
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
    </MedicalRecordsContext.Provider>
  );
};

export default MedicalRecordsProvider;
