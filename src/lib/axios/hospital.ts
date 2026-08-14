import axios, { InternalAxiosRequestConfig } from "axios";
import { getHospitalToken, refreshHospitalToken } from "../../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstanceHos = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstanceHos.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getHospitalToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

axiosInstanceHos.interceptors.response.use(
  (res: any) => res,
  async (error: any) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes("api/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const data = await refreshHospitalToken();
        
        if (data?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axiosInstanceHos(originalRequest);
        }
      } catch (err) {
        console.error("Hospital session expired. Redirecting...");
        
        sessionStorage.removeItem("hospital_token");
        sessionStorage.removeItem("hospital_role");
        
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstanceHos;
