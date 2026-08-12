import axiosInstance from "../lib/axios";
import { PatientInfo, PaginatedResponse, VitalSignsInfo } from "../types/patients/shared";
import { MedicalRecordsDashboardResponse } from "../types/patients/home";
import { AppointmentDetail } from "../types/patients/appointments";
import { DrugRecordDetail } from "../types/patients/drugs";
import { SubAccount } from "../types/patients/sub-accounts";
import { SubscriptionPlan } from "../types/patients/subscriptions";

export async function fetchPatientProfile(): Promise<PatientInfo> {
  const res = await axiosInstance.get("api/patients/dashboard");
  return res.data.patient_info;
}

export async function fetchPatientVitalSigns(page: number = 1): Promise<PaginatedResponse<VitalSignsInfo>> {
  const res = await axiosInstance.get(`api/patients/vital-signs?page=${page}`);
  return res.data;
}

export async function fetchSubaccounts(page: number, pageSize: number, search?: string): Promise<PaginatedResponse<SubAccount>> {
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
): Promise<PaginatedResponse<AppointmentDetail>> {
  let url = `api/patients/appointments?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  if (dateFrom) url += `&scheduled_time_gte=${dateFrom}`;
  if (dateTo) url += `&scheduled_time_lte=${dateTo}`;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function fetchPatientDrugRecords(page: number, pageSize: number, search?: string): Promise<PaginatedResponse<DrugRecordDetail>> {
  let url = `api/patients/drug-records?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function fetchPatientMedicalRecords(page: number, pageSize: number, search?: string): Promise<MedicalRecordsDashboardResponse> {
  let url = `api/patients/dashboard?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await axiosInstance.get("api/subscriptions/plans/role/patient");
  return res.data;
}

export async function updatePatientAccount(payload: any): Promise<any> {
  const res = await axiosInstance.patch("api/patients/update", payload);
  return res.data;
}

export async function deactivatePatientAccount(): Promise<any> {
  const res = await axiosInstance.delete("api/patients/delete");
  return res.data;
}

export async function fetchSubaccountMedicalRecords(
  hin: string,
  page: number,
  pageSize: number
): Promise<PaginatedResponse<any>> {
  const res = await axiosInstance.get(
    `api/patients/subaccounts/medical-records/${hin}?page=${page}&size=${pageSize}`
  );
  return res.data;
}

export async function subscribeToPlan(planId: string): Promise<any> {
  const res = await axiosInstance.post("api/subscriptions/subscribe", { plan: planId });
  return res.data;
}
