import React, { createContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRadiologyProfile } from "../../../queries/Hospital/radiology/profile";
import { getHospitalToken } from "../../../services/authService";
import { rememberHospitalLogo } from "../../../utils/hospitalBranding";

export const RadiologyAppContext = createContext();

const RadiologyProfileProvider = ({ children }) => {
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending: profileLoading } = useQuery({
    queryKey: ["radiology-profile"],
    queryFn: fetchRadiologyProfile,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 60 * 30,
  });

  const profile = data?.staff_info;
  const backgroundImage = data?.hospital_theme?.bg_image;
  const hospitalName = data?.hospital_info?.name;
  const hospitalLogo = data?.hospital_theme?.profile_image;

  useEffect(() => {
    rememberHospitalLogo(hospitalLogo);
  }, [hospitalLogo]);

  return (
    <RadiologyAppContext.Provider
      value={{
        profile: profile || null,
        isLoading: !profile && isUserLoggedIn && profileLoading,
        backgroundImage,
        hospitalName,
        hospitalLogo,
      }}
    >
      {children}
    </RadiologyAppContext.Provider>
  );
};

export default RadiologyProfileProvider;
