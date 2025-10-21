import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";

export const AppContext = createContext();

const ProfileProvider = (props) => {
  const [profile, setProfile] = useState(null);
  const [newEmergencyStatus, setNewEmergencyStatus] = useState(null)
  const isUserLoggedIn = !!getToken();



  console.log(isUserLoggedIn);
  useEffect(() => {
    if (isUserLoggedIn) {
      const fetchProfile = async () => {
        try {
          const res = await axiosInstance.get("api/patients/dashboard"); // Example endpoint
          setProfile(res.data.patient_info);
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

  const toggleEmergencyStatus = async () => {
    try {
      const res = await axiosInstance.patch("api/patients/emergency");
      setNewEmergencyStatus(res.data?.emergency);
      toast.success("Emergency status updated!");
      return res.data?.emergency;
    } catch (err) {
      toast.error("Failed to update emergency status");
      console.error(err);
      throw err;
    }
  };


  return (
    <AppContext.Provider value={{profile, newEmergencyStatus, toggleEmergencyStatus}}>{props.children}</AppContext.Provider>
  );
};

export default ProfileProvider;
