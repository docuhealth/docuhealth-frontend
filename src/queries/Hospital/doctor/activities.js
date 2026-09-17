import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchRecentCareActivities = async ({ queryKey }) => {
  const [_key, hin] = queryKey;
  if (!hin) return null;
  const res = await axiosInstanceHos.get(`api/doctors/patient/activities/${hin}`);
  return res.data;
};

// GET /api/medical-records/events/<event_sqid> — resolves one activity feed
// row to its full record detail, whatever the record type. Replaces the old
// per-type `<segment>/<hin>/<sqid>` routes (all removed server-side as of
// 2026-09-16 — see `unified-event-detail.md`). Confirmed live for SoapNote,
// VitalSigns, NursingAssessment, LabTestOrder and Admission (the last two
// aren't even listed in that handoff's type table, but work).
//
// IMPORTANT: `<event_sqid>` is the activity's own top-level `sqid` from
// `fetchRecentCareActivities` (i.e. `activity.sqid`) — NOT `record.sqid`.
// Passing the record's sqid 404s.
export const fetchMedicalRecordDetail = async ({ queryKey }) => {
  const [_key, _recordType, eventSqid] = queryKey;
  if (!eventSqid) return null;
  const res = await axiosInstanceHos.get(`api/medical-records/events/${eventSqid}`);
  return res.data;
};
