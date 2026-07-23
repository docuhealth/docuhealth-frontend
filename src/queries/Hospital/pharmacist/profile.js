import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchPharmacistProfile = async () => {
  try {
    const res = await axiosInstanceHos.get("api/auth/hospital/staff/profile");
    return res.data;
  } catch (error) {
    console.error("Pharmacist profile endpoint might not exist yet", error);
    // Mock data for now if the endpoint doesn't exist
    return {
      pharmacist: {
        firstname: "Hospital",
        lastname: "Pharmacist",
        role: "pharmacist",
        email: "pharmacist@hospital.com",
      },
      theme: {
        name: "DocuHealth Hospital",
        bg_image: null,
        profile_image: null,
      }
    };
  }
};

export const fetchPharmacistDashboardMetrics = async () => {
  try {
    const res = await axiosInstanceHos.get("api/pharmacists/dashboard-metrics");
    return res.data;
  } catch (error) {
    // Mock metrics
    return {
      total_prescriptions: 0,
      pending_prescriptions: 0,
      completed_prescriptions: 0,
    };
  }
};
