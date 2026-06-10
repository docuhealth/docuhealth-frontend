import React, { useState, createContext } from "react";

export const LabAppointmentsListContext = createContext();

const DUMMY_APPOINTMENTS = [
  {
    id: 1,
    patient_name: "Amara Osei",
    patient_hin: "HIN-001234",
    test_name: "Complete Blood Count (CBC)",
    note: "Routine annual checkup panel",
    hospital_name: "Central General Hospital",
    scheduled_at: "2026-06-12T09:00:00",
    requested_by: "Dr. Kwame Mensah",
    patient: { age: 34, sex: "Female" },
  },
  {
    id: 2,
    patient_name: "Kofi Asante",
    patient_hin: "HIN-002891",
    test_name: "Lipid Panel",
    note: "Follow-up on elevated cholesterol",
    hospital_name: "Central General Hospital",
    scheduled_at: "2026-06-12T10:30:00",
    requested_by: "Dr. Esi Boateng",
    patient: { age: 52, sex: "Male" },
  },
  {
    id: 3,
    patient_name: "Abena Darko",
    patient_hin: "HIN-003456",
    test_name: "Urinalysis",
    note: "Suspected UTI, confirm before prescribing",
    hospital_name: "Central General Hospital",
    scheduled_at: "2026-06-13T08:15:00",
    requested_by: "Dr. Kwame Mensah",
    patient: { age: 28, sex: "Female" },
  },
  {
    id: 4,
    patient_name: "Yaw Frimpong",
    patient_hin: "HIN-004120",
    test_name: "Fasting Blood Glucose",
    note: "Diabetes monitoring — 3-month interval",
    hospital_name: "Central General Hospital",
    scheduled_at: "2026-06-13T11:00:00",
    requested_by: "Dr. Esi Boateng",
    patient: { age: 61, sex: "Male" },
  },
  {
    id: 5,
    patient_name: "Akosua Nimako",
    patient_hin: "HIN-005678",
    test_name: "Thyroid Function Tests (TFTs)",
    note: "Patient reports fatigue and weight gain",
    hospital_name: "Central General Hospital",
    scheduled_at: "2026-06-14T09:45:00",
    requested_by: "Dr. Kwame Mensah",
    patient: { age: 45, sex: "Female" },
  },
];

const pageSize = 7;

const LabAppointmentsListProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const appointments = DUMMY_APPOINTMENTS;
  const count = appointments.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <LabAppointmentsListContext.Provider value={{
      appointments,
      count,
      currentPage,
      setCurrentPage,
      totalPages,
      loading: false,
      isRefreshing: false,
      searchQuery,
      setSearchQuery,
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
    }}>
      {props.children}
    </LabAppointmentsListContext.Provider>
  );
};

export default LabAppointmentsListProvider;
