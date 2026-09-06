import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. Creates a care task (+ its first scheduled occurrences) on
// an admitted patient's admission in one call.
// task_type: "procedure" | "vital_signs" | "medication" | "input_output" | "glucose" | "iv_fluid"
// Medication tasks resolve to an array of task objects (one per drug);
// every other task type resolves to a single task object.
export const createInpatientTask = async ({ admissionSqid, payload }) => {
  const res = await axiosInstanceHos.post(`api/inpatients/admissions/${admissionSqid}/tasks`, payload);
  return res.data;
};

// Doctor-only. Lists the care tasks a doctor issued for an admission — the
// task definitions, not the per-schedule occurrences the nurse queue shows.
// GET /api/inpatients/tasks/<admission_sqid>?page=&size= (page size max 100),
// verified live 2026-09-06. Standard paginated envelope
// { count, next, previous, results }, results newest-created first.
//
// Only an `active` or `awaiting_nurse_discharge` admission is valid: a fully
// discharged admission returns 400 `{ admission: "This is not a valid admission" }`,
// an unknown sqid returns 404.
//
// Result item shape:
//   sqid,
//   task_type: "vital_signs" | "medication" | "input_output" | "procedure"
//            | "glucose" | "iv_fluid" | "seizure_event" | "nurse_in_patient_discharge",
//   start_time (ISO),
//   frequency (FrequencyEnum, e.g. "q6h" / "once"),
//   duration: { value (number), rate: "hours"|"days"|"weeks"|"months" } | null
//             (null = runs until discharge),
//   repeat_until: "duration" | "discharge",
//   priority: "low" | "medium" | "high" | "urgent",
//   instructions (string),
//   status: "active" | "completed"  (stored status),
//   completion_time (ISO | null; null when the task has no duration),
//   effective_status: "active" | "completed" | "duration_completed"
//     ("duration_completed" once completion_time has passed but status is still active),
//   created_by_info: { sqid, staff_id, firstname, lastname, role, specialization }
export const fetchInpatientTasks = async ({ admissionSqid, page = 1, size = 100 }) => {
  const res = await axiosInstanceHos.get(
    `api/inpatients/tasks/${admissionSqid}?page=${page}&size=${size}`,
  );
  return res.data;
};
