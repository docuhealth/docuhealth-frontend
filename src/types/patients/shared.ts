export interface PatientInfo {
  firstname?: string;
  lastname?: string;
  hin?: string;
  dob?: string;
  gender?: string;
}

export interface StaffInfo {
  firstname?: string;
  lastname?: string;
  specialization?: string;
}

export interface HospitalInfo {
  name?: string;
  email?: string;
}

export interface VitalSignsInfo {
  blood_pressure?: string;
  temp?: string | number;
  weight?: string | number;
  resp_rate?: string | number;
  heart_rate?: string | number;
  height?: string | number;
}

export interface InvestigationDoc {
  filename?: string;
  file?: string;
  url?: string;
  size?: number;
  file_type?: string;
}
