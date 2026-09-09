export interface SubscriptionSummary {
  status?: string;
  plan_name?: string;
  is_subscribed?: boolean;
  name?: string | null;
  interval?: string | null;
  payment_due?: boolean;
  [key: string]: any;
}

export interface PatientInfo {
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  hin?: string;
  dob?: string;
  gender?: string;
  email?: string;
  phone_num?: string;
  emergency?: boolean;
  id_card_generated?: boolean;
  id_card?: any;
  subscription?: SubscriptionSummary | null;
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
  created_at?: string;
  blood_pressure?: string;
  temp?: string | number;
  weight?: string | number;
  resp_rate?: string | number;
  heart_rate?: string | number;
  height?: string | number;
  bmi?: string | number;
  spo2?: string | number;
  sp02?: string | number;
  pain_score?: string | number;
}

export interface InvestigationDoc {
  filename?: string;
  file?: string;
  url?: string;
  size?: number;
  file_type?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
}
