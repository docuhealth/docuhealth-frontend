import React, { useEffect, useState, useMemo, createContext } from "react";

export const LabRequestsContext = createContext();

const TAB_STATUS_MAP = {
  "Pending Test": "pending",
  "In-progress": "in_progress",
  "Completed test": "completed",
  "Rejected test": "rejected",
};

const DUMMY_REQUESTS = [
  {
    sqid: "req-001",
    status: "pending",
    created_at: "2026-06-20T09:00:00",
    note: "Routine check before surgery",
    patient_info: { firstname: "Amara", lastname: "Okafor", hin: "HIN-001234", gender: "Female", dob: "1990-03-15" },
    test_info: { name: "Complete Blood Count (CBC)", parameters: [], specimens: [{ name: "Venous Blood", container: "EDTA tube", is_preferred: true }], special_instructions: "Fasting not required" },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Kwame", lastname: "Mensah", role: "doctor" },
  },
  {
    sqid: "req-002",
    status: "pending",
    created_at: "2026-06-20T10:30:00",
    note: "Follow-up on elevated cholesterol",
    patient_info: { firstname: "Kofi", lastname: "Asante", hin: "HIN-002891", gender: "Male", dob: "1974-07-22" },
    test_info: { name: "Lipid Panel", parameters: [], specimens: [{ name: "Serum", container: "SST tube", is_preferred: true }], special_instructions: "Patient must fast for 12 hours" },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Esi", lastname: "Boateng", role: "doctor" },
  },
  {
    sqid: "req-003",
    status: "pending",
    created_at: "2026-06-19T08:15:00",
    note: "Suspected UTI",
    patient_info: { firstname: "Abena", lastname: "Darko", hin: "HIN-003456", gender: "Female", dob: "1998-11-05" },
    test_info: { name: "Urinalysis", parameters: [], specimens: [{ name: "Midstream Urine", container: "Sterile cup", is_preferred: true }] },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Kwame", lastname: "Mensah", role: "doctor" },
  },
  {
    sqid: "req-004",
    status: "in_progress",
    created_at: "2026-06-18T11:00:00",
    note: "Diabetes monitoring — 3-month interval",
    patient_info: { firstname: "Yaw", lastname: "Frimpong", hin: "HIN-004120", gender: "Male", dob: "1965-01-30", payment_category: "HMO Patient" },
    test_info: { name: "Fasting Blood Glucose", parameters: [{ sqid: "p1", name: "Glucose", unit: "mmol/L", ref_low: 3.9, ref_high: 5.6 }], specimens: [{ name: "Venous Blood", container: "Fluoride tube", is_preferred: true }] },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Esi", lastname: "Boateng", role: "doctor" },
  },
  {
    sqid: "req-005",
    status: "in_progress",
    created_at: "2026-06-17T09:45:00",
    note: "Patient reports fatigue and weight gain",
    specimen_collected_at: "17 Jun 2026, 10:05 AM",
    patient_info: { firstname: "Akosua", lastname: "Nimako", hin: "HIN-005678", gender: "Female", dob: "1981-05-18", payment_category: "Private" },
    test_info: { name: "Thyroid Function Tests (TFTs)", parameters: [{ sqid: "p2", name: "TSH", unit: "mIU/L", ref_low: 0.4, ref_high: 4.0 }, { sqid: "p3", name: "Free T4", unit: "pmol/L", ref_low: 9.0, ref_high: 25.0 }], specimens: [{ name: "Serum", container: "SST tube", is_preferred: true }] },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Kwame", lastname: "Mensah", role: "doctor" },
  },
  {
    sqid: "req-006",
    status: "completed",
    created_at: "2026-06-15T14:00:00",
    specimen_collected_at: "15 Jun 2026, 2:30 PM",
    patient_info: { firstname: "Emeka", lastname: "Nwosu", hin: "HIN-006789", gender: "Male", dob: "1988-09-12" },
    test_info: { name: "Malaria Rapid Test", parameters: [{ sqid: "p4", name: "Malaria Antigen", unit: "", ref_text: "Negative" }], specimens: [{ name: "Capillary Blood", container: "EDTA tube", is_preferred: true }] },
    result_info: { parameters: [{ parameter_info: { name: "Malaria Antigen", unit: "", ref_text: "Negative" }, value: "Negative" }], interpretation: "No malaria parasites detected.", clinical_correlation: "Correlate with clinical symptoms.", comments: "Repeat if symptoms persist." },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Esi", lastname: "Boateng", role: "doctor" },
  },
  {
    sqid: "req-007",
    status: "completed",
    created_at: "2026-06-14T13:30:00",
    specimen_collected_at: "14 Jun 2026, 9:00 AM",
    patient_info: { firstname: "Fatima", lastname: "Bello", hin: "HIN-007890", gender: "Female", dob: "1995-02-28" },
    test_info: { name: "Liver Function Tests (LFTs)", parameters: [{ sqid: "p5", name: "ALT", unit: "U/L", ref_low: 7, ref_high: 40 }, { sqid: "p6", name: "AST", unit: "U/L", ref_low: 10, ref_high: 40 }] },
    result_info: { parameters: [{ parameter_info: { name: "ALT", unit: "U/L", ref_low: 7, ref_high: 40 }, value: "32" }, { parameter_info: { name: "AST", unit: "U/L", ref_low: 10, ref_high: 40 }, value: "27" }], interpretation: "Liver enzymes within normal limits." },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Kwame", lastname: "Mensah", role: "doctor" },
  },
  {
    sqid: "req-008",
    status: "rejected",
    created_at: "2026-06-13T11:15:00",
    rejection_reason: "Specimen received was haemolysed. Please collect a fresh sample.",
    patient_info: { firstname: "Chidi", lastname: "Eze", hin: "HIN-008901", gender: "Male", dob: "1979-06-03" },
    test_info: { name: "Kidney Function Tests (KFTs)", parameters: [] },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Esi", lastname: "Boateng", role: "doctor" },
  },
  {
    sqid: "req-009",
    status: "rejected",
    created_at: "2026-06-12T10:00:00",
    rejection_reason: "Insufficient sample volume submitted.",
    patient_info: { firstname: "Ngozi", lastname: "Adeyemi", hin: "HIN-009012", gender: "Female", dob: "2001-12-19" },
    test_info: { name: "Widal Test", parameters: [] },
    hospital_info: { name: "Central General Hospital", email: "lab@centralhospital.com" },
    ordered_by: { firstname: "Kwame", lastname: "Mensah", role: "doctor" },
  },
];

const DUMMY_CATEGORIES = [
  { sqid: "cat-1", name: "Haematology" },
  { sqid: "cat-2", name: "Biochemistry" },
  { sqid: "cat-3", name: "Microbiology" },
  { sqid: "cat-4", name: "Serology" },
];

const PAGE_SIZE = 6;

const LabRequestsProvider = (props) => {
  const [activeTab, setActiveTab] = useState("Pending Test");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory]);

  const statusFilter = TAB_STATUS_MAP[activeTab];

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return DUMMY_REQUESTS.filter((r) => {
      if (r.status !== statusFilter) return false;
      if (q) {
        const name = `${r.patient_info?.firstname || ""} ${r.patient_info?.lastname || ""}`.toLowerCase();
        const test = r.test_info?.name?.toLowerCase() || "";
        if (!name.includes(q) && !test.includes(q)) return false;
      }
      return true;
    });
  }, [statusFilter, searchQuery]);

  const count = filtered.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const requests = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <LabRequestsContext.Provider value={{
      requests,
      count,
      activeTab,
      setActiveTab: handleTabChange,
      currentPage,
      setCurrentPage,
      totalPages,
      loading: false,
      isRefreshing: false,
      searchQuery,
      setSearchQuery,
      categories: DUMMY_CATEGORIES,
      selectedCategory,
      setSelectedCategory,
    }}>
      {props.children}
    </LabRequestsContext.Provider>
  );
};

export default LabRequestsProvider;
