import React, { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLabProfile } from "../../../queries/Hospital/lab/profile";
import { getHospitalToken } from "../../../services/authService";

export const LabAppContext = createContext();

const LabProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending } = useQuery({
    queryKey: ["lab-profile"],
    queryFn: fetchLabProfile,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 60 * 30,
  });

  const profile         = data?.lab_scientist;
  const backgroundImage = data?.theme?.bg_image;
  const hospitalName    = data?.theme?.name;
  const stats           = data?.stats || null;
  const recentPatients  = data?.recent_patients || [];

  return (
    <LabAppContext.Provider value={{
      profile: profile || null,
      isLoading: isPending && isUserLoggedIn,
      backgroundImage,
      hospitalName,
      stats,
      recentPatients,
    }}>
      {children}
    </LabAppContext.Provider>
  );
};

export default LabProfileProvider;
