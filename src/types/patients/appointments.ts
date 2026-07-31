import type { HospitalInfo, StaffInfo } from "./shared";

export interface AppointmentDetail {
  id?: string | number;
  type?: string;
  scheduled_time?: string;
  note?: string;
  hospital_info?: HospitalInfo;
  staff?: StaffInfo;
  status?: string;
}
