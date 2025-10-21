import React, { useEffect, useState, createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export const AppointmentsContext = createContext();

const AppointmentsProvider = (props) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 7; // Example page size

  const isUserLoggedIn = !!getToken();

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `api/patients/appointments?page=${page}&size=${pageSize}`
      );
      console.log(res.data);

      setAppointments(res.data.results || []);
      setCount(res.data.count || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    if (isUserLoggedIn) {
        fetchAppointments(1); // Fetch on mount
    }
    }, [isUserLoggedIn]);

  return (
    <AppointmentsContext.Provider
      value={{ appointments, setAppointments, loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages, fetchAppointments }}
    >
      {props.children}
    </AppointmentsContext.Provider>
  );
};

export default AppointmentsProvider;
