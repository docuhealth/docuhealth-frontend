import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor in-patient discharge: POST /api/inpatients/admissions/<admission_sqid>/doc-discharge-form.
// Records the doctor's discharge summary and raises a nurse discharge task; the bed is only
// freed once a nurse executes that task. Follow-up fields are optional but cross-field
// validated, and a no-follow-up body must still send follow_up_clinic: null (backend bug).
// Full field contract: DOCTOR-INPATIENT-DISCHARGE-FOLLOW-UP.md.
export const createDoctorInpatientDischarge = async ({ admissionSqid, ...body }) => {
  const res = await axiosInstanceHos.post(
    `api/inpatients/admissions/${admissionSqid}/doc-discharge-form`,
    body,
  );
  return res.data;
};

// Doctor-facing discharge summary lookup. The only source is the paginated
// GET /api/inpatients/discharged-patients (no per-admission route, query filters are
// ignored server-side), so page the list and match admission_sqid client-side. Each row
// carries doctor_discharge_form and nurse_discharge_form (either may be null). Returns
// null when no summary was recorded.
export const fetchInpatientDischargeSummary = async ({ admissionSqid }) => {
  if (!admissionSqid) return null;

  const size = 100;
  let page = 1;

  // Page until a page has no `next`; the guard is just a safety net (size=100
  // covers realistic single-hospital volumes in one request).
  for (let guard = 0; guard < 50; guard += 1) {
    const { data } = await axiosInstanceHos.get(
      `api/inpatients/discharged-patients?page=${page}&size=${size}`,
    );
    const match = (data?.results || []).find(
      (row) => row.admission_sqid === admissionSqid,
    );
    if (match) return match;
    if (!data?.next) return null;
    page += 1;
  }
  return null;
};
