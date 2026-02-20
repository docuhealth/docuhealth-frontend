import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";
import { fetchPatientMedicalRecords } from "../../queries/Patient/patientMedicalRecords";
import { useQuery, keepPreviousData } from "@tanstack/react-query";


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
    placeholderData : keepPreviousData,
  })

   // Handle errors via useEffect since onError was removed from useQuery v5
  useEffect(() => {
    if (isError) {
      toast.error("Error fetching medical records");
      console.error(error);
    }
  }, [isError, error]);

  console.log(data)

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
        setCurrentPage
      }}
    >
      {props.children}
    </MedicalRecordsContext.Provider>
  );
};

export default MedicalRecordsProvider;
