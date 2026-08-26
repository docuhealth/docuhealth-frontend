import axiosInstanceHos from "../../../lib/axios/hospital";

// A patient's progress notes (SOAP-shaped: subjective/objective/assessments/
// plan), scoped to a specific admission. Doctor-only.
export const fetchProgressNotes = async ({ queryKey }) => {
  const [_key, hin, page, size] = queryKey;
  const res = await axiosInstanceHos.get(
    `api/medical-records/progress-notes/${hin}?page=${page}&size=${size}`,
  );
  return res.data;
};

// payload: { patient: hin, admission: admissionSqid, subjective, objective, assessments, plan }
export const createProgressNote = async (payload) => {
  const res = await axiosInstanceHos.post("api/medical-records/progress-notes", payload);
  return res.data;
};
