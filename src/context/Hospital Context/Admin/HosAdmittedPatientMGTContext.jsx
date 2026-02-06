import React, { useState, createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../../../utils/axiosInstanceHos";
import { getHospitalToken } from "../../../services/authService";

export const HosAdmittedPatientMGTContext = createContext();

const HosAdmittedPatientMGTProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState('active'); // 'active' or 'discharged'
  const pageSize = 6;
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isLoading: loading } = useQuery({
    // 🔹 The Key is the secret: it tracks both status and page
    queryKey: ["hospital-patients", tab, currentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/hospitals/admissions/${tab}?page=${currentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: isUserLoggedIn,
    placeholderData: (previousData) => previousData, // Smooth transition between pages
  });

  const admittedPatients = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  // 🔹 Helper to switch tabs and reset page
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); 
  };

  return (
    <HosAdmittedPatientMGTContext.Provider value={{
      admittedPatients,
      loading,
      count,
      currentPage,
      totalPages,
      setCurrentPage, // Pass the setter directly for pagination
      tab,
      setTab: handleTabChange
    }}>
      {children}
    </HosAdmittedPatientMGTContext.Provider>
  );
};

export default HosAdmittedPatientMGTProvider;