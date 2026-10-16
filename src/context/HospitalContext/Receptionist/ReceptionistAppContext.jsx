import React, { createContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchReceptionistProfile } from "../../../queries/Hospital/receptionist/profile";
import { rememberHospitalLogo } from "../../../utils/hospitalBranding";

export const ReceptionistAppContext = createContext();

const ReceptionistProfileProvider = (props) => {
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending: profileLoading } = useQuery({
    queryKey: ["receptionist-profile"],
    queryFn: fetchReceptionistProfile,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 60 * 30,
  });

  const profile = data?.receptionist;
  const backgroundImage = data?.theme?.bg_image;
  const hospitalName = data?.theme?.name;
  const hospitalLogo = data?.theme?.profile_image;

  useEffect(() => {
    rememberHospitalLogo(hospitalLogo);
  }, [hospitalLogo]);

  return (
    <ReceptionistAppContext.Provider
      value={{
        profile: profile || null,
        isLoading: !profile && isUserLoggedIn && profileLoading,
        backgroundImage,
        hospitalName,
        hospitalLogo,
      }}
    >
      {props.children}
    </ReceptionistAppContext.Provider>
  );
};

export default ReceptionistProfileProvider;
