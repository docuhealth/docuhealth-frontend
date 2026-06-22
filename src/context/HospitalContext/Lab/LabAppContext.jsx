import React, { createContext } from "react";

export const LabAppContext = createContext();

const DUMMY_PROFILE = {
  firstname: "Ama",
  lastname: "Owusu",
  email: "ama.owusu@centralhospital.com",
  role: "lab_scientist",
};

const DUMMY_STATS = {
  total_requests: 142,
  total_requests_trend: 12,
  pending_tests: 38,
  pending_tests_trend: -5,
  completed_tests: 104,
  completed_tests_trend: 8,
};

const DUMMY_RECENT_PATIENTS = [
  { patient_name: "Amara Okafor", patient_hin: "HIN-001234", patient_sex: "Female", created_at: "2026-06-20T09:15:00", staff: { firstname: "Kwame", lastname: "Mensah", role: "doctor" } },
  { patient_name: "Kofi Asante", patient_hin: "HIN-002891", patient_sex: "Male", created_at: "2026-06-20T10:30:00", staff: { firstname: "Esi", lastname: "Boateng", role: "lab" } },
  { patient_name: "Abena Darko", patient_hin: "HIN-003456", patient_sex: "Female", created_at: "2026-06-19T08:15:00", staff: { firstname: "Kwame", lastname: "Mensah", role: "doctor" } },
  { patient_name: "Yaw Frimpong", patient_hin: "HIN-004120", patient_sex: "Male", created_at: "2026-06-19T11:00:00", staff: { firstname: "Esi", lastname: "Boateng", role: "lab" } },
  { patient_name: "Akosua Nimako", patient_hin: "HIN-005678", patient_sex: "Female", created_at: "2026-06-18T09:45:00", staff: { firstname: "Kwame", lastname: "Mensah", role: "doctor" } },
  { patient_name: "Emeka Nwosu", patient_hin: "HIN-006789", patient_sex: "Male", created_at: "2026-06-18T14:00:00", staff: { firstname: "Esi", lastname: "Boateng", role: "lab" } },
  { patient_name: "Fatima Bello", patient_hin: "HIN-007890", patient_sex: "Female", created_at: "2026-06-17T13:30:00", staff: { firstname: "Kwame", lastname: "Mensah", role: "doctor" } },
  { patient_name: "Chidi Eze", patient_hin: "HIN-008901", patient_sex: "Male", created_at: "2026-06-17T11:15:00", staff: { firstname: "Esi", lastname: "Boateng", role: "lab" } },
  { patient_name: "Ngozi Adeyemi", patient_hin: "HIN-009012", patient_sex: "Female", created_at: "2026-06-16T10:00:00", staff: { firstname: "Kwame", lastname: "Mensah", role: "doctor" } },
  { patient_name: "Yusuf Lawal", patient_hin: "HIN-010123", patient_sex: "Male", created_at: "2026-06-16T09:00:00", staff: { firstname: "Esi", lastname: "Boateng", role: "lab" } },
];

const LabProfileProvider = ({ children }) => {
  return (
    <LabAppContext.Provider
      value={{
        profile: DUMMY_PROFILE,
        isLoading: false,
        backgroundImage: null,
        hospitalName: "Central General",
        hospitalLogo: null,
        stats: DUMMY_STATS,
        recentPatients: DUMMY_RECENT_PATIENTS,
      }}
    >
      {children}
    </LabAppContext.Provider>
  );
};

export default LabProfileProvider;
