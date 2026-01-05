import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { fetchPatientMedicalRecords } from "../../queries/Patient/patientMedicalRecords";
import { useQuery } from "@tanstack/react-query";


export const MedicalRecordsContext = createContext();

const MedicalRecordsProvider = (props) => {

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
    queryKey : ["medicalRecords", currentPage, pageSize],
    queryFn: fetchPatientMedicalRecords,
    enabled : isUserLoggedIn,
    keepPreviousData : true,
    onError: () => {
      toast.error("Error fetching medical records");
    },
  })

  const medicalRecords = data?.results || [];
  const count = data?.count || 0;
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
        setCurrentPage
      }}
    >
      {props.children}
    </MedicalRecordsContext.Provider>
  );
};

export default MedicalRecordsProvider;
