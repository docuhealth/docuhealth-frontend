import React, { useEffect, useState } from "react";
import { createContext } from "react";
import axiosInstanceHos from "../../../utils/axiosInstanceHos";
import { getHospitalToken } from "../../../services/authService";
import toast from "react-hot-toast";

export const HosAppContext = createContext();

const HosProfileProvider = (props) => {
  const [profile, setProfile] = useState(null);
  const [wards, setWards] = useState([]);

  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 7; // Example page size

  const isUserLoggedIn = !!getHospitalToken();

        const fetchProfile = async () => {
        try {
          const res = await axiosInstanceHos.get("api/hospitals/info"); // Example endpoint
          setProfile(res.data.hospital_profile);
          console.log(res.data.hospital_profile);
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };
      

      const fetchWards = async (page = 1) => {
        setLoading(true);
        try {
          const res = await axiosInstanceHos.get(
            `api/hospitals/wards?page=${page}&size=${pageSize}`,
          );
          console.log("wards ", res);
          setWards(res.data.results || []);
          setCount(res.data.count || 0);
          setCurrentPage(page);
          setTotalPages(Math.ceil(res.data.count / pageSize));
        } catch (err) {
          console.error("Error fetching wards:", err);
          toast.error("Error fetching wards");
        }finally{
        setLoading(false);
        }
      };
  useEffect(() => {
    if (isUserLoggedIn) {
      fetchProfile();
      fetchWards(1);
    } else {
      return;
    }
  }, [isUserLoggedIn]);

  return (
    <HosAppContext.Provider value={{ profile, wards, fetchWards, loading, count, currentPage, setCurrentPage, totalPages }}>
      {props.children}
    </HosAppContext.Provider>
  );
};

export default HosProfileProvider;
