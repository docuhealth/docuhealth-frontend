import React, { createContext, useState, useEffect } from "react";
import axiosInstanceHos from "../../../lib/axios/hospital";
import toast from "react-hot-toast";

export const PharmacistPrescriptionsContext = createContext();

const TAB_STATUS_MAP = {
  "Pending Dispensation": "pending",
  "Settled Dispensation": "dispensed",
};

export const PharmacistPrescriptionsProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending Dispensation");
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);

  // Sorting
  const [ordering, setOrdering] = useState("-created_at");

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const status = TAB_STATUS_MAP[activeTab];
      let url = `api/pharmacy/orders?status=${status}&page=${currentPage}&ordering=${ordering}`;

      const response = await axiosInstanceHos.get(url);
      const data = response.data;
      
      if (data?.results) {
        setOrders(data.results);
        setCount(data.count || 0);
        // Assuming page size is 10
        setTotalPages(Math.ceil((data.count || 0) / 10) || 1);
      } else {
        setOrders([]);
        setCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching pharmacist orders:", error);
      toast.error("Failed to fetch prescriptions.");
      setOrders([]);
      setCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, currentPage, ordering]);

  return (
    <PharmacistPrescriptionsContext.Provider
      value={{
        orders,
        activeTab,
        setActiveTab,
        loading,
        currentPage,
        setCurrentPage,
        totalPages,
        count,
        ordering,
        setOrdering,
        fetchOrders
      }}
    >
      {children}
    </PharmacistPrescriptionsContext.Provider>
  );
};

export default PharmacistPrescriptionsProvider;
