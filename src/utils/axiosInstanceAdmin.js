// utils/axiosInstanceAdmin.js
import axios from "axios";
import { getToken, refreshToken } from "../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstanceAdmin = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach token on requests
axiosInstanceAdmin.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
axiosInstanceAdmin.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const data = await refreshToken();
        if (data?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axiosInstanceAdmin(originalRequest);
        }
      } catch (err) {
        console.error("Admin session expired. Redirecting...");
        sessionStorage.clear();
        window.location.href = "/dhadmin-login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstanceAdmin;
