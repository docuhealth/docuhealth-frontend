import axios, { InternalAxiosRequestConfig } from "axios";
import { getToken, refreshToken } from "../../services/authService";
import { normalizeEmailFields } from "../../utils/normalizationUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      config.data = normalizeEmailFields(config.data);
    }
    if (config.params) {
      config.params = normalizeEmailFields(config.params);
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res: any) => res,
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const data = await refreshToken();
        if (data?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.error("Auto-refresh failed → redirecting to login");
        sessionStorage.clear();
        window.location.href = "/user-login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
