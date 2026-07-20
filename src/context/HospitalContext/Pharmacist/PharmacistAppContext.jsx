import React, { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPharmacistProfile, fetchPharmacistDashboardMetrics } from "../../../queries/Hospital/pharmacist/profile";
import { fetchDocuHealthHospitals } from "../../../queries/Hospital/doctor/profile";
import { getHospitalToken } from "../../../services/authService";

export const PharmacistAppContext = createContext();

const PharmacistProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending: profileLoading } = useQuery({
    queryKey: ["pharmacist-profile"],
    queryFn: fetchPharmacistProfile,
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
    queryKey: ["pharmacists-dashboard-metrics"],
    queryFn: fetchPharmacistDashboardMetrics,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5, 
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const profile = data?.pharmacist;
  const backgroundImage = data?.theme?.bg_image;
  const hospitalName = data?.theme?.name;
  const hospitalLogo = data?.theme?.profile_image;

  return (
    <PharmacistAppContext.Provider value={{
      profile: profile || null,
      hospitals: hospitals || [],
      isLoading: !profile && isUserLoggedIn,
      backgroundImage,
      hospitalName,
      hospitalLogo,
      dashboardMetrics,
      dashboardMetricsLoading,
    }}>
      {children}
    </PharmacistAppContext.Provider>
  );
};

export default PharmacistProfileProvider;
