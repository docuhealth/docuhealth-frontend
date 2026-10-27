import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. POST /api/hospital-ops/admission/transfer — move an admitted patient to a
// different bed. Fields: admission (admission SQID), new_bed (an `available` bed SQID);
// the ward is derived from the bed.
export const transferAdmission = async ({ admission, new_bed }) => {
  const res = await axiosInstanceHos.post("api/hospital-ops/admission/transfer", {
    admission,
    new_bed,
  });
  return res.data;
};
