import React, { createContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctorProfile, fetchDocuHealthHospitals } from "../../../queries/Hospital/doctor/profile";
import { fetchHospitalDoctorDashboardMetrics } from "../../../queries/Hospital/doctor/dashboard_metrics";
import { getHospitalToken } from "../../../services/authService";
import { rememberHospitalLogo } from "../../../utils/hospitalBranding";

export const DoctorAppContext = createContext();

const DoctorProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending: profileLoading } = useQuery({
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
    queryKey: ["doctors-dashboard-metrics"],
    queryFn: fetchHospitalDoctorDashboardMetrics,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5, 
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const profile = data?.doctor;
  const backgroundImage = data?.theme?.bg_image;
  const hospitalName = data?.theme?.name;
  const hospitalLogo = data?.theme?.profile_image;

  useEffect(() => {
    rememberHospitalLogo(hospitalLogo);
  }, [hospitalLogo]);

  return (
    <DoctorAppContext.Provider value={{
      profile: profile || null,
      hospitals: hospitals || [],
      isLoading: !profile && isUserLoggedIn && profileLoading,
      backgroundImage,
      hospitalName,
      hospitalLogo,
      dashboardMetrics,
      dashboardMetricsLoading,
    }}>
      {children}
    </DoctorAppContext.Provider>
  );
};

export default DoctorProfileProvider;