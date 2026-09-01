import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only admission actions.

// POST /api/doctors/admissions/transfer — move an admitted patient to a
// different ward + bed.
//
//   admission  - admission SQID (the doctor inpatient list row's `sqid`)
//   new_ward   - destination ward SQID
//   new_bed    - destination bed SQID (must be an `available` bed)
//
// NOTE (2026-08-31): the live endpoint currently rejects SQIDs with
// `400 "Incorrect type. Expected pk value, received str."` and wants integer
// pks, which the ward/bed list responses don't expose. `POST
// /api/doctors/admissions/request` already accepts SQIDs; this one needs to
// match. Tracked in BACKEND_ISSUES.md.
export const transferAdmission = async ({ admission, new_ward, new_bed }) => {
  const res = await axiosInstanceHos.post("api/doctors/admissions/transfer", {
    admission,
    new_ward,
    new_bed,
  });
  return res.data;
};
