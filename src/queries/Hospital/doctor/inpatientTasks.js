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
