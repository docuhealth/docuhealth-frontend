import axiosInstanceHos from "../../../lib/axios/hospital";

// The API sorts newest scan first and `scanned_at` is the time of the patient's latest result in the last 24 hours.

export const fetchRadiologyRecentPatients = async ({ queryKey }) => {
  const [, page = 1] = queryKey;
  const res = await axiosInstanceHos.get(`api/radiology/patients/recents?page=${page}`);
  const data = res.data || {};

  const results = (data.results || []).map((p) => ({
    patient_name: `${p.firstname || ""} ${p.lastname || ""}`.trim() || "Unknown",
    firstname: p.firstname,
    lastname: p.lastname,
    patient_hin: p.hin,
    patient_sex: p.gender,
    scanned_at: p.scanned_at,
  }));

  return { results, count: data.count || 0 };
};
