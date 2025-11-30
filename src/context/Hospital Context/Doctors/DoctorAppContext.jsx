import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const DoctorAppContext = createContext()

const DoctorProfileProvider = (props)=> {
    const [profile, setProfile] = useState(null);
    const isUserLoggedIn = !!getHospitalToken();

    useEffect(() => {
        if (isUserLoggedIn) {
          const fetchProfile = async () => {
            try {
              const res = await axiosInstance.get("api/doctor/dashboard"); 
              setProfile(res.data.receptionist);
            

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
        <DoctorAppContext.Provider value={{ profile }}>
          {props.children}
        </DoctorAppContext.Provider>
      )

}

export default DoctorProfileProvider