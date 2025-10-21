import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export const MedicalRecordsContext = createContext();

const MedicalRecordsProvider = (props) => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // ✅ 6 per page

  const isUserLoggedIn = !!getToken();

  const fetchMedicalRecords = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `api/patients/dashboard?page=${page}&size=${pageSize}`
      );
      console.log(res.data);

      setMedicalRecords(res.data.results || []);
      setCount(res.data.count || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error("Error fetching medical records:", err);
      toast.error("Error fetching medical records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchMedicalRecords(1); // ✅ Fetch on mount
    }
  }, [isUserLoggedIn]);

  return (
    <MedicalRecordsContext.Provider
      value={{ medicalRecords, setMedicalRecords, loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages, fetchMedicalRecords }}
    >
      {props.children}
    </MedicalRecordsContext.Provider>
  );
};

export default MedicalRecordsProvider;
