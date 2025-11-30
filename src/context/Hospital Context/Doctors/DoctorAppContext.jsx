import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const DoctorAppContext = createContext()

const DoctorProfileProvider = (props)=> {
    const [profile, setProfile] = useState(null);
    const [hospitals, setHospitals] = useState([])
    const isUserLoggedIn = !!getHospitalToken();

    useEffect(() => {
        if (isUserLoggedIn) {
          const fetchProfile = async () => {
            try {
              const res = await axiosInstance.get("api/doctors/dashboard"); 
              setProfile(res.data.doctor);
            

            } catch (err) {
              console.error("Error fetching profile:", err);
            }
          };
          fetchProfile();

            const fetchDocuHealthHospitals = async (page = 1, pageSize = 100) => {
            try {
              const res = await axiosInstance.get(`api/hospitals/hospitals?page=${page}&size=${pageSize}`); 
              console.log('docuhealth hospitals ', res)
              setHospitals(res.data.results);
            

            } catch (err) {
              console.error("Error fetching profile:", err);
            }
          };
          fetchDocuHealthHospitals();
        } else {
          return;
        }
      }, [isUserLoggedIn]);



      return (
        <DoctorAppContext.Provider value={{ profile, hospitals }}>
          {props.children}
        </DoctorAppContext.Provider>
      )

}

export default DoctorProfileProvider