import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const HosAppContext = createContext();

const HosProfileProvider = (props) => {
    const [profile, setProfile] = useState(null);
    const isUserLoggedIn = !!getHospitalToken();

  
    useEffect(() => {
      if (isUserLoggedIn) {
        const fetchProfile = async () => {
          try {
            const res = await axiosInstance.get("api/hospitals/info"); // Example endpoint
            setProfile(res.data);
            // console.log(res.data);
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
        <HosAppContext.Provider value={{ profile }}>{props.children}</HosAppContext.Provider>
    );
};

export default HosProfileProvider;
