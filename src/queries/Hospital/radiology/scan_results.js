import axiosInstanceHos from "../../../lib/axios/hospital";
import { mapScanOrderItem } from "./scan_requests";

// Doctor-only approval of radiology results. The list only holds scans this doctor ordered themselves; radiologist-ordered results never appear because they are approved on upload.

// Each row is an order item carrying its waiting result under `pending_result`.
const mapPendingRow = (row) => ({
  ...mapScanOrderItem({ ...row, results: row.pending_result ? [row.pending_result] : [] }),
  result_sqid: row.pending_result?.sqid,
});

export const fetchPendingScanResults = async ({ queryKey }) => {
  const [, page = 1, size = 9] = queryKey;
  const res = await axiosInstanceHos.get(`api/radiology/results/pending?page=${page}&size=${size}`);
  const data = res.data || {};
  return { results: (data.results || []).map(mapPendingRow), count: data.count || 0 };
};

export const acceptScanResult = async ({ sqid }) => {
  const res = await axiosInstanceHos.patch(`api/radiology/results/${sqid}/accept`);
  return res.data;
};

// Rejecting keeps the item at image_collected so the radiologist can upload a fresh attempt.
export const rejectScanResult = async ({ sqid, rejection_reason }) => {
  const res = await axiosInstanceHos.patch(`api/radiology/results/${sqid}/reject`, { rejection_reason });
  return res.data;
};

// A patient's approved scan results at this hospital. No per-patient endpoint exists: `search` matches patient names only (not HIN or full name), so search by last name and keep this patient's rows by HIN.
// An item reaches `completed` once its result is approved; keep only rows that actually carry an approved result (a reject after approval strands some).
export const fetchPatientApprovedScanResults = async ({ queryKey }) => {
  const [, hin, lastname] = queryKey;
  const params = new URLSearchParams({ status: "completed", size: "100" });
  if (lastname?.trim()) params.set("search", lastname.trim());
  const res = await axiosInstanceHos.get(`api/radiology/orders/items?${params.toString()}`);
  return (res.data?.results || [])
    .filter((item) => item.order_info?.patient_info?.hin === hin)
    .map(mapScanOrderItem)
    .filter((row) => row.report?.status === "approved")
    .sort((a, b) => new Date(b.report.reported_at || b.created_at) - new Date(a.report.reported_at || a.created_at));
};

// Approved results for scans this doctor ordered (completed items whose result is approved), newest first.
// No doctor-scoped endpoint exists, so pull the hospital's completed items and keep the doctor's own by staff_id.
export const fetchDoctorApprovedScanResults = async ({ queryKey }) => {
  const [, staffId] = queryKey;
  const res = await axiosInstanceHos.get("api/radiology/orders/items?status=completed&size=100");
  return (res.data?.results || [])
    .filter((item) => item.order_info?.ordered_by_info?.staff_id === staffId)
    .map(mapScanOrderItem)
    .filter((row) => row.report?.status === "approved");
};
