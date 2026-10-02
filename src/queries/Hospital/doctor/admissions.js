import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. POST /api/doctors/admissions/transfer — move an admitted patient to a
// different bed. Fields: admission (admission SQID), new_bed (an `available` bed SQID);
// the ward is derived from the bed.
export const transferAdmission = async ({ admission, new_bed }) => {
  const res = await axiosInstanceHos.post("api/doctors/admissions/transfer", {
    admission,
    new_bed,
  });
  return res.data;
};
