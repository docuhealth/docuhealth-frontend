import axiosInstanceHos from "../../../lib/axios/hospital";

// Real endpoint has no scan timestamp field, so RecentPatients.jsx's date/time columns fall back to "—".

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
  }));

  return { results, count: data.count || 0 };
};
