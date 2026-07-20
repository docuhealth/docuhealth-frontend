import { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchHospitalProfile } from "../../../queries/Hospital/admin/profile";
import { fetchHospitalDashboardMetrics } from "../../../queries/Hospital/admin/dashboard_metrics";

export const HosAppContext = createContext();

const HosProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending: profileLoading } = useQuery({
    queryKey: ["hospital-profile"],
    queryFn: fetchHospitalProfile,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 60 * 30, 
  });

  const { data: dashboardMetrics, isPending: dashboardMetricsLoading } = useQuery({
    queryKey: ["hospital-dashboard-metrics"],
    queryFn: fetchHospitalDashboardMetrics,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5, 
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const profile = data?.hospital_profile;
  const hospital_email = data?.email;

  return (
    <HosAppContext.Provider value={{ profile, hospital_email, loading: profileLoading, dashboardMetrics, dashboardMetricsLoading }}>
      {children}
    </HosAppContext.Provider>
  );
};

export default HosProfileProvider;