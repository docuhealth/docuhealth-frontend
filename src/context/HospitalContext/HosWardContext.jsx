import React, { createContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../services/authService";
import { fetchWards } from "../../queries/Hospital/fetchWards";

export const HosWardContext = createContext();

const HosWardProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  
const { 
  data: wardsData, 
  isPending: wardsLoading,
  isPlaceholderData,
  refetch: refetchWards 
} = useQuery({
  queryKey: ["hospital-wards", currentPage], // currentPage is at index 1
  queryFn: fetchWards, // Pass the function reference only!
  enabled: isUserLoggedIn,
  placeholderData: (previousData) => previousData,
});

  // Derived values for the UI
  const wards = wardsData?.results || [];
  const count = wardsData?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const value = {
    wards,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    wardsLoading,
    isNextPageLoading: isPlaceholderData,
    refetchWards
  };

  return (
    <HosWardContext.Provider value={value}>
      {children}
    </HosWardContext.Provider>
  );
};

export default HosWardProvider;