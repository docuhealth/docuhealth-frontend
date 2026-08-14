import { PatientInfo } from "./shared";
import { MedicalRecord } from "./home";

export interface SubAccount extends PatientInfo {
  id?: string | number;
  medical_records?: MedicalRecord[];
  is_active?: boolean;
}
