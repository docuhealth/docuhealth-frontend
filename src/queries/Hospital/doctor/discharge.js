import axiosInstanceHos from "../../../lib/axios/hospital";

// In-patient discharge.
//
// POST /api/medical-records/discharge is multipart/form-data ONLY (a JSON body
// gets a 415), and the list/object fields have to go in as JSON-encoded strings
// — the serializer parses them back out of the multipart body on the way in.
//
// payload:
//   admission               - admission sqid (string, required)
//   chief_complaint         - string, required
//   condition_on_discharge  - string, required
//   diagnosis               - string[], required (non-empty)
//   treatment_plan          - string[], required (non-empty)
//   care_instructions       - string[], required (non-empty)
//   drug_records            - DrugRecord[], key required (may be [])
//   follow_up_appointment   - { type, note, scheduled_time } | null (key required)
//   investigation_docs      - File[] (optional)
export const createInpatientDischarge = async ({
  admission,
  chief_complaint,
  condition_on_discharge,
  diagnosis = [],
  treatment_plan = [],
  care_instructions = [],
  drug_records = [],
  follow_up_appointment = null,
  investigation_docs = [],
}) => {
  const fd = new FormData();
  fd.append("admission", admission);
  fd.append("chief_complaint", chief_complaint);
  fd.append("condition_on_discharge", condition_on_discharge);
  fd.append("diagnosis", JSON.stringify(diagnosis));
  fd.append("treatment_plan", JSON.stringify(treatment_plan));
  fd.append("care_instructions", JSON.stringify(care_instructions));
  fd.append("drug_records", JSON.stringify(drug_records));
  fd.append("follow_up_appointment", JSON.stringify(follow_up_appointment));
  investigation_docs.forEach((file) => fd.append("investigation_docs", file));

  const res = await axiosInstanceHos.post("api/medical-records/discharge", fd);
  return res.data;
};
