import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. Creates a care task (+ its first scheduled occurrences) on an admission.
// task_type: procedure | vital_signs | medication | input_output | glucose | iv_fluid.
// Medication tasks resolve to an array (one per drug); every other type to a single object.
export const createInpatientTask = async ({ admissionSqid, payload }) => {
  const res = await axiosInstanceHos.post(`api/inpatients/admissions/${admissionSqid}/tasks`, payload);
  return res.data;
};

// Doctor-only. Lists the care task definitions a doctor issued for an admission (not the
// per-schedule occurrences the nurse queue shows): GET /api/inpatients/tasks/<admission_sqid>?page=&size=
// (size max 100), standard paginated envelope, newest first. Only `active` /
// `awaiting_nurse_discharge` admissions are valid. Each row carries an `effective_status`
// of active | completed | duration_completed (the last once completion_time has passed).
export const fetchInpatientTasks = async ({ admissionSqid, page = 1, size = 100 }) => {
  const res = await axiosInstanceHos.get(
    `api/inpatients/tasks/${admissionSqid}?page=${page}&size=${size}`,
  );
  return res.data;
};
