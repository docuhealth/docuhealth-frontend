import React, { useEffect, useState, useMemo, createContext } from "react";

export const LabResultsContext = createContext();

const DUMMY_RESULTS = [
  { id: "RES-001", patient_name: "Emeka Nwosu", test_name: "Malaria Rapid Test", result_value: "Negative", uploaded_at: "2026-06-15T15:30:00", flag: "Normal" },
  { id: "RES-002", patient_name: "Fatima Bello", test_name: "Liver Function Tests (LFTs)", result_value: "ALT: 32 U/L, AST: 27 U/L", uploaded_at: "2026-06-14T14:45:00", flag: "Normal" },
  { id: "RES-003", patient_name: "Blessing Obi", test_name: "Fasting Blood Glucose", result_value: "7.2 mmol/L", uploaded_at: "2026-06-13T11:00:00", flag: "Abnormal" },
  { id: "RES-004", patient_name: "Kelechi Nnadi", test_name: "Complete Blood Count (CBC)", result_value: "Hb: 9.8 g/dL, WBC: 11.2×10⁹/L", uploaded_at: "2026-06-12T09:30:00", flag: "Abnormal" },
  { id: "RES-005", patient_name: "Halima Usman", test_name: "Urinalysis", result_value: "Normal", uploaded_at: "2026-06-11T10:15:00", flag: "Normal" },
  { id: "RES-006", patient_name: "Tunde Afolabi", test_name: "Lipid Panel", result_value: "Total Cholesterol: 6.1 mmol/L", uploaded_at: "2026-06-10T13:20:00", flag: "Abnormal" },
  { id: "RES-007", patient_name: "Amara Okafor", test_name: "Thyroid Function Tests", result_value: "TSH: 2.1 mIU/L, Free T4: 14.5 pmol/L", uploaded_at: "2026-06-09T08:00:00", flag: "Normal" },
  { id: "RES-008", patient_name: "Yaw Frimpong", test_name: "Widal Test", result_value: "S. Typhi O: 1:160, H: 1:80", uploaded_at: "2026-06-08T15:00:00", flag: "Abnormal" },
  { id: "RES-009", patient_name: "Akosua Nimako", test_name: "HIV Rapid Test", result_value: "Non-reactive", uploaded_at: "2026-06-07T09:45:00", flag: "Normal" },
  { id: "RES-010", patient_name: "Kofi Asante", test_name: "HbA1c", result_value: "7.8%", uploaded_at: "2026-06-06T11:30:00", flag: "Abnormal" },
];

const PAGE_SIZE = 10;

const LabResultsProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return DUMMY_RESULTS;
    return DUMMY_RESULTS.filter(
      (r) =>
        r.patient_name.toLowerCase().includes(q) ||
        r.test_name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const count = filtered.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const results = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <LabResultsContext.Provider value={{
      results,
      count,
      currentPage,
      setCurrentPage,
      totalPages,
      loading: false,
      isRefreshing: false,
      searchQuery,
      setSearchQuery,
    }}>
      {props.children}
    </LabResultsContext.Provider>
  );
};

export default LabResultsProvider;
