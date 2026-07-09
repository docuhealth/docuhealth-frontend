import React, { createContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctorProfile, fetchDocuHealthHospitals } from "../../../queries/Hospital/doctor/profile";
import { fetchHospitalDoctorDashboardMetrics } from "../../../queries/Hospital/doctor/dashboard_metrics";
import { getHospitalToken } from "../../../services/authService";

export const DoctorAppContext = createContext();

const DoctorProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();

    const [dateRange, setDateRange] = useState({
      start_date: "",
      end_date: "",
    });


  const { data } = useQuery({
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

    const { data: dashboardMetrics, isPending: dashboardMetricsLoading } = useQuery({
      queryKey: ["doctors-dashboard-metrics", dateRange],
      queryFn: fetchHospitalDoctorDashboardMetrics,
      enabled: isUserLoggedIn,
      staleTime: 1000 * 5, 
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    });
  
    const updateDateRange = (newRange) => {
      setDateRange((prev) => ({ ...prev, ...newRange }));
    };



  const profile = data?.doctor;
  const backgroundImage = data?.theme?.bg_image;
  const hospitalName = data?.theme?.name;
  const hospitalLogo = data?.theme?.profile_image;




  return (
    <DoctorAppContext.Provider value={{
      profile: profile || null,
      hospitals: hospitals || [],
      isLoading: !profile && isUserLoggedIn,
      backgroundImage,
      hospitalName,
      hospitalLogo,
      dashboardMetrics,
      dashboardMetricsLoading,
      dateRange,
      updateDateRange,
    }}>
      {children}
    </DoctorAppContext.Provider>
  );
};

export default DoctorProfileProvider;