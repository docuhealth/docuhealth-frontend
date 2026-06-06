import React, { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchLabProfile } from "../../../queries/Hospital/lab/profile";

export const LabAppContext = createContext();

const LabProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending: profileLoading } = useQuery({
    queryKey: ["lab-profile"],
    queryFn: fetchLabProfile,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 60 * 30,
  });

  const profile = data?.lab_scientist;
  const backgroundImage = data?.theme?.bg_image;
  const hospitalName = data?.theme?.name;
  const hospitalLogo = data?.theme?.profile_image;
  const stats = data?.stats || null;
  const recentPatients = data?.recent_patients || [];


    return (
    <LabAppContext.Provider
      value={{
        profile: profile || null,
        isLoading: profileLoading,
        backgroundImage,
        hospitalName,
        hospitalLogo,
        stats,
        recentPatients,
      }}
    >
      {children}
    </LabAppContext.Provider>
  );
};

export default LabProfileProvider;
