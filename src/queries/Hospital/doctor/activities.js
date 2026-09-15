import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchRecentCareActivities = async ({ queryKey }) => {
  const [_key, hin] = queryKey;
  if (!hin) return null;
  const res = await axiosInstanceHos.get(`api/doctors/patient/activities/${hin}`);
  return res.data;
};

// GET /api/medical-records/<segment>/<hin>/<sqid> — resolves one activity
// feed record (`record.type` + `record.sqid` from fetchRecentCareActivities)
// to its full detail. Confirmed live 2026-09-15, see
// RECENT_ACTIVITIES_HANDOFF_VERIFICATION.md. Segment names mostly match the
// record type lowercase-hyphenated, EXCEPT `progress-note` — the backend's
// list/create routes are plural (`progress-notes`), but this detail route is
// singular; confirmed live, not a typo (`progress-notes/<hin>/<sqid>` 404s).
// Only the types the doctor dashboard's Recent Care Activities feed actually
// emits are wired up here; the rest of `DOC-GET-MEDICAL-RECORD-DETAIL.md`'s
// endpoints follow the same `<segment>/<hin>/<sqid>` shape and can be added
// the same way once the feed emits them (e.g. `ProgressNotes: "progress-note"`,
// not `"progress-notes"`).
const RECORD_DETAIL_SEGMENT = {
  VitalSigns: "vital-signs",
  NursingAssessment: "nursing-assessment",
  SoapNote: "soap-note",
};

export const fetchMedicalRecordDetail = async ({ queryKey }) => {
  const [_key, recordType, hin, sqid] = queryKey;
  const segment = RECORD_DETAIL_SEGMENT[recordType];
  if (!segment || !hin || !sqid) return null;
  const res = await axiosInstanceHos.get(`api/medical-records/${segment}/${hin}/${sqid}`);
  return res.data;
};
