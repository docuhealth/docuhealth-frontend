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
      });

      const profile = data?.nurse ;
      const wardInfo = data?.ward_info


  return (
    <NursesAppContext.Provider value={{ profile, wardInfo }}>
        {props.children}
    </NursesAppContext.Provider>
  )
}

export default NursesProfileProvider