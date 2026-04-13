import axiosInstanceAdmin from "../../utils/axiosInstanceAdmin";

// Fetch Users (Patients or Hospitals)
export const fetchAdminUsers = async ({ queryKey }) => {
  const [_key, role, page, pageSize] = queryKey;
  const response = await axiosInstanceAdmin.get(`/api/admin/users/${role}`, {
    params: { page, size: pageSize }
  });
  return response.data;
};

// Deactivate Hospital
export const deactivateAdminHospital = async (hins) => {
  const response = await axiosInstanceAdmin.post('/api/admin/hospitals/deactivate', {
    hins: hins
  });
  return response.data;
};

// Deactivate Patient (assuming similar structure, using IDs or NINs)
export const deactivateAdminPatient = async (patientIds) => {
  // We deduce /api/admin/patients/deactivate based on the hospital one
  const response = await axiosInstanceAdmin.post('/api/admin/patients/deactivate', {
    patient_ids: patientIds
  });
  return response.data;
};

// Activate Hospital
export const activateAdminHospital = async (hins) => {
  const response = await axiosInstanceAdmin.post('/api/admin/hospitals/activate', {
    hins: hins
  });
  return response.data;
};

// Activate Patient
export const activateAdminPatient = async (patientIds) => {
  const response = await axiosInstanceAdmin.post('/api/admin/patients/activate', {
    patient_ids: patientIds
  });
  return response.data;
};
