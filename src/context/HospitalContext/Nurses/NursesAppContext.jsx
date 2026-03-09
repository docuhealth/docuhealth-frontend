import React, { useEffect, useState, createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../../services/authService";
import { fetchNurseProfile } from "../../../queries/Hospital/nurse/profile";


export const NursesAppContext = createContext()


const NursesProfileProvider = (props) => {

    const isUserLoggedIn = !!getHospitalToken();

      const { data, isPending } = useQuery({
        queryKey: ["nurse-profile"],
        queryFn: fetchNurseProfile,
        enabled: isUserLoggedIn,
        staleTime: 1000 * 60 * 30, 
      });

      const profile = data?.nurse ;
      const wardInfo = data?.ward_info
      const backgroundImage = data?.theme?.bg_image
        const hospitalName = data?.theme?.name;


  return (
    <NursesAppContext.Provider value={{ profile, wardInfo, backgroundImage, hospitalName }}>
        {props.children}
    </NursesAppContext.Provider>
  )
}

export default NursesProfileProvider