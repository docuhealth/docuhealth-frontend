import type { PatientInfo, StaffInfo, HospitalInfo, VitalSignsInfo, InvestigationDoc, PaginatedResponse } from "./shared";
import type { AppointmentDetail } from "./appointments";
import type { DrugRecordDetail } from "./drugs";

export interface MedicalRecord {
  id?: string | number;
  created_at?: string;
  subaccount?: string;
  patient_info?: PatientInfo;
  staff_info?: StaffInfo;
  hospital_info?: HospitalInfo;
  vital_signs_info?: VitalSignsInfo;
  chief_complaint?: string;
  primary_diagnosis?: string;
  investigation_docs?: InvestigationDoc[];
  drug_orders_info?: DrugRecordDetail[];
  drug_records?: DrugRecordDetail[];
  lab_tests_info?: any[];
  lab_tests?: any[];
  care_instructions?: string[];
  treatment_plan?: string[];
  appointment?: AppointmentDetail;
}

export interface MedicalRecordsDashboardResponse {
  medical_records: PaginatedResponse<MedicalRecord>;
  patient_info?: PatientInfo;
}
