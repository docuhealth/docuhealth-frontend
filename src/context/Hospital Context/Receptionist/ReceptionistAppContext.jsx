import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstanceHos from "../../../utils/axiosInstanceHos";
import { getHospitalToken } from "../../../services/authService";

export const ReceptionistAppContext = createContext();

const ReceptionistProfileProvider = (props) => {
    const [profile, setProfile] = useState(null);
    const [wards, setWards] = useState([]);
    const isUserLoggedIn = !!getHospitalToken();

    // console.log(isUserLoggedIn)

    useEffect(() => {
        if (isUserLoggedIn) {
          const fetchProfile = async () => {
            try {
              const res = await axiosInstanceHos.get("api/receptionists/dashboard"); // Example endpoint
              setProfile(res.data.receptionist);
            
              // console.log(res.data);
            } catch (err) {
              console.error("Error fetching profile:", err);
            }
          };
          fetchProfile();

          const fetchWards = async (page = 1, pageSize = 10) => {
            try {
              const res = await axiosInstanceHos.get(
                `api/hospitals/wards?page=${page}&size=${pageSize}`
              );
              console.log("wards ", res);
              setWards(res.data.results);
            } catch (err) {
              console.error("Error fetching wards:", err);
              toast.error("Error fetching wards");
            }
          };
    
          fetchWards(1);
        } else {
          return;
        }
      }, [isUserLoggedIn]);

      // console.log(profile)

      return(
        <ReceptionistAppContext.Provider value={{ profile, wards }}>{props.children}</ReceptionistAppContext.Provider>
      )
}

export default ReceptionistProfileProvider;