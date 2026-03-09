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
 

      return(
        <ReceptionistAppContext.Provider value={{ profile, backgroundImage, hospitalName, loading: profileLoading }}>{props.children}</ReceptionistAppContext.Provider>
      )
}

export default ReceptionistProfileProvider;