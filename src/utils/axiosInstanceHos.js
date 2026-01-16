import axios from "axios";
import { getHospitalToken, refreshHospitalToken } from "../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstanceHos = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach hospital token to every outgoing request
axiosInstanceHos.interceptors.request.use(
  (config) => {
    const token = getHospitalToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized responses (Token Expiration)
axiosInstanceHos.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    // Also ensure we aren't trying to refresh the refresh call itself
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes("api/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const data = await refreshHospitalToken();
        
        if (data?.access_token) {
          // Update the header for the original failed request
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          // Execute the original request again with the new token
          return axiosInstanceHos(originalRequest);
        }
      } catch (err) {
        console.error("Hospital session expired. Redirecting...");
        
        // Clear hospital-specific data only to avoid breaking patient sessions if both are open
        sessionStorage.removeItem("hospital_token");
        sessionStorage.removeItem("hospital_role");
        
        window.location.href = "/hospital-login"; // Adjust this path to your actual hospital login
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstanceHos;