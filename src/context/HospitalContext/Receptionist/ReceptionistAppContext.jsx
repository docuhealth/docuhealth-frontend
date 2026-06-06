import React, { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchReceptionistProfile } from "../../../queries/Hospital/receptionist/profile";

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
 

      return(
        <ReceptionistAppContext.Provider value={{ profile, backgroundImage, hospitalName, hospitalLogo, loading: profileLoading }}>{props.children}</ReceptionistAppContext.Provider>
      )
}

export default ReceptionistProfileProvider;