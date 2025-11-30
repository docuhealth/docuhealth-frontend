import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const HosAppContext = createContext();

const HosProfileProvider = (props) => {
    const [profile, setProfile] = useState(null);
    const [wards, setWards] = useState([])
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

        const fetchWards = async(page = 1, pageSize = 10) => {
          try{
            const res = await axiosInstance.get(`api/hospitals/wards?page=${page}&size=${pageSize}`)
            console.log( 'wards ' , res)
            setWards(res.data.results)
          }catch(err){
            console.error("Error fetching wards:", err);
            toast.error("Error fetching wards");
          }
        }

        fetchWards(1)
      } else {
        return;
      }
    }, [isUserLoggedIn]);


    return (
        <HosAppContext.Provider value={{ profile, wards }}>{props.children}</HosAppContext.Provider>
    );
};

export default HosProfileProvider;
