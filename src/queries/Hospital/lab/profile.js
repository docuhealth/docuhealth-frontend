import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchLabProfile = async () => {
  const res = await axiosInstanceHos.get("api/lab/dashboard");
  return res.data;
};

// Lab Admin Profile endpoints (GET /api/lab/profile, PATCH /api/lab/update-profile)
export const fetchLabAdminProfile = async () => {
  const res = await axiosInstanceHos.get("api/lab/profile");
  return res.data;
};

export const updateLabProfile = async (formData) => {
  const res = await axiosInstanceHos.patch("api/lab/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
