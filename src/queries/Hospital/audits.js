import axiosInstanceHos from "../../lib/axios/hospital";

// Result download history. type: "laboratory" | "radiology". Lab admin, radiologist (and hospital admin once the backend allows it)
export const fetchAuditLogs = async ({ type, page = 1, pageSize = 10 }) => {
  const res = await axiosInstanceHos.get(`api/audits/audit-logs?type=${type}&page=${page}&size=${pageSize}`);
  return res.data;
};
