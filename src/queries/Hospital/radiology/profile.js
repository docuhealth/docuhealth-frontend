import axiosInstanceHos from "../../../lib/axios/hospital";

// Shared, role-agnostic endpoint — already returns the correct profile for
// whichever hospital staff member is logged in, so this works today even
// before the backend has radiology-specific endpoints.
export const fetchRadiologyProfile = async () => {
  try {
    const res = await axiosInstanceHos.get("api/auth/hospital/staff/profile");
    return res.data;
  } catch (error) {
    console.error("Radiology profile endpoint might not exist yet", error);
    // Mock data for now if the endpoint doesn't exist
    return {
      staff_info: {
        firstname: "Hospital",
        lastname: "Radiology",
        role: "radiologist",
        email: "radiology@hospital.com",
      },
      hospital_theme: {
        name: "DocuHealth Hospital",
        bg_image: null,
        profile_image: null,
      },
      hospital_info: {
        name: "DocuHealth Hospital",
      },
    };
  }
};
