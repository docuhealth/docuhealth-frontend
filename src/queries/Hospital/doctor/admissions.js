import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. POST /api/doctors/admissions/transfer — move an admitted patient to a
// different ward + bed. Fields: admission (admission SQID), new_ward, new_bed (an
// `available` bed SQID).
export const transferAdmission = async ({ admission, new_ward, new_bed }) => {
  const res = await axiosInstanceHos.post("api/doctors/admissions/transfer", {
    admission,
    new_ward,
    new_bed,
  });
  return res.data;
};
