import React, { createContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../../../utils/axiosInstanceHos";
import { getHospitalToken } from "../../../services/authService";

export const DoctorsAdmittedPatientMGTContext = createContext();

const DoctorsAdmittedPatientMGTProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState("active");
  const pageSize = 6;
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ["hospital-patients-doctor", tab, currentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/hospitals/admissions/${tab}?page=${currentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: isUserLoggedIn,
    placeholderData: (previousData) => previousData,
  });

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); // Reset page on tab switch
  };

  return (
    <DoctorsAdmittedPatientMGTContext.Provider
      value={{
        admittedPatients: data?.results || [],
        loading,
        count: data?.count || 0,
        currentPage,
        totalPages: Math.ceil((data?.count || 0) / pageSize),
        setCurrentPage,
        tab,
        setTab: handleTabChange,
        refetch, 
      }}
    >
      {children}
    </DoctorsAdmittedPatientMGTContext.Provider>
  );
};

export default DoctorsAdmittedPatientMGTProvider;