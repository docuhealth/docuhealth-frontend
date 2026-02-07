import React, { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctorProfile, fetchDocuHealthHospitals } from "../../../queries/Hospital/doctor/profile"; 
import { getHospitalToken } from "../../../services/authService";

export const DoctorAppContext = createContext();

const DoctorProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();


  const { data: profile } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: fetchDoctorProfile,
    enabled: isUserLoggedIn, 
    staleTime: 1000 * 60 * 30, 
  });


  const { data: hospitals } = useQuery({
    queryKey: ["docuhealth-hospitals-list"],
    queryFn: fetchDocuHealthHospitals,
    enabled: isUserLoggedIn,
    placeholderData: [], 
  });

  return (
    <DoctorAppContext.Provider value={{ 
      profile: profile || null, 
      hospitals: hospitals || [],
      isLoading: !profile && isUserLoggedIn 
    }}>
      {children}
    </DoctorAppContext.Provider>
  );
};

export default DoctorProfileProvider;