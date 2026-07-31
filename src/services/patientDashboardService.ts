import axiosInstance from "../lib/axios";
import { PatientInfo } from "../types/patients/shared";
import { MedicalRecord } from "../types/patients/home"; 

export async function fetchPatientProfile(): Promise<PatientInfo> {
  const res = await axiosInstance.get("api/patients/dashboard");
  return res.data.patient_info;
}

export async function fetchPatientVitalSigns(page: number = 1): Promise<any> {
  const res = await axiosInstance.get(`api/patients/vital-signs?page=${page}`);
  return res.data;
}

export async function fetchSubaccounts(page: number, pageSize: number, search?: string): Promise<any> {
  let url = `api/patients/subaccounts?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function createSubaccount(payload: any): Promise<any> {
  const res = await axiosInstance.post("/api/patients/subaccounts", payload);
  return res.data;
}

export async function upgradeSubaccount(payload: any): Promise<any> {
  const res = await axiosInstance.post("/api/patients/subaccounts/upgrade", payload);
  return res.data;
}

export async function fetchPatientAppointments(
  page: number,
  pageSize: number,
  search?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<any> {
  let url = `api/patients/appointments?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  if (dateFrom) url += `&scheduled_time_gte=${dateFrom}`;
  if (dateTo) url += `&scheduled_time_lte=${dateTo}`;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function fetchPatientDrugRecords(page: number, pageSize: number, search?: string): Promise<any> {
  let url = `api/patients/drug-records?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function fetchPatientMedicalRecords(page: number, pageSize: number, search?: string): Promise<MedicalRecord[]> {
  let url = `api/patients/dashboard?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function fetchSubscriptionPlans(): Promise<any> {
  const res = await axiosInstance.get("api/subscriptions/plans/role/patient");
  return res.data;
}
