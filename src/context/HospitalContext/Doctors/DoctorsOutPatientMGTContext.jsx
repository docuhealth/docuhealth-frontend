import React, { createContext, useState, useEffect } from "react";
import useDebounce from "../../../hooks/useDebounce";

export const DoctorsOutPatientMGTContext = createContext();

const DoctorsOutPatientMGTProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // MOCK DATA for outpatients
  const [outPatients, setOutPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      const mockOutPatients = [
        {
          id: 1,
          sqid: "outp-1234",
          status: "doctor_active",
          admission_date: new Date().toISOString(), // reusing this for UI sort
          patient_info: {
            hin: "HIN-8930",
            firstname: "John",
            lastname: "Doe",
            gender: "Male",
            dob: "1990-05-15",
          },
          staff_info: {
            firstname: "Jane",
            lastname: "Smith",
          },
          ward_info: { name: "Outpatient Dept" },
          bed_info: null
        },
        {
          id: 2,
          sqid: "outp-5678",
          status: "doctor_active",
          admission_date: new Date(Date.now() - 86400000).toISOString(),
          patient_info: {
            hin: "HIN-4521",
            firstname: "Alice",
            lastname: "Johnson",
            gender: "Female",
            dob: "1985-11-22",
          },
          staff_info: {
            firstname: "Jane",
            lastname: "Smith",
          },
          ward_info: { name: "Outpatient Dept" },
          bed_info: null
        }
      ];

      // Simple mock search filtering
      let filtered = mockOutPatients;
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        filtered = mockOutPatients.filter(p => 
          p.patient_info?.firstname.toLowerCase().includes(query) ||
          p.patient_info?.lastname.toLowerCase().includes(query) ||
          p.patient_info?.hin.toLowerCase().includes(query)
        );
      }

      setOutPatients(filtered);
      setCount(filtered.length);
      setLoading(false);
    }, 500);
  }, [debouncedSearch, currentPage]);

  const totalPages = Math.ceil(count / pageSize);

  const fetchOutPatients = () => {
    // In real implementation this would invalidate query or re-fetch
  };

  return (
    <DoctorsOutPatientMGTContext.Provider
      value={{
        outPatients,
        loading,
        count,
        currentPage,
        setCurrentPage,
        totalPages,
        searchQuery,
        setSearchQuery,
        isRefreshing: loading,
        fetchOutPatients
      }}
    >
      {children}
    </DoctorsOutPatientMGTContext.Provider>
  );
};

export default DoctorsOutPatientMGTProvider;
