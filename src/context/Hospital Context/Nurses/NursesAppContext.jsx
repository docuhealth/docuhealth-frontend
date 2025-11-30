import React, { useEffect, useState, createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const NursesAppContext = createContext()


const NursesProfileProvider = (props) => {
    const [profile, setProfile] = useState(null);
    const [wardInfo, setWardInfo] = useState(null)
    const isUserLoggedIn = !!getHospitalToken();

    useEffect(() => {
        if (isUserLoggedIn) {
          const fetchProfile = async () => {
            try {
              const res = await axiosInstance.get("api/nurses/dashboard"); // Example endpoint
              setProfile(res.data.nurse);
              setWardInfo(res.data.ward_info)
            
              console.log(res.data);
            } catch (err) {
              console.error("Error fetching profile:", err);
            }
          };
          fetchProfile();
        } else {
          return;
        }
      }, [isUserLoggedIn]);


  return (
    <NursesAppContext.Provider value={{ profile, wardInfo }}>
        {props.children}
    </NursesAppContext.Provider>
  )
}

export default NursesProfileProvider