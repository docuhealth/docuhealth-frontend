import axiosInstanceHos from "../../../lib/axios/hospital";
import { mapScanOrderItem } from "./scan_requests";

// Doctor-only approval of radiology results. The list only holds scans this doctor ordered themselves; walk-in results never appear because they are approved on upload.

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
