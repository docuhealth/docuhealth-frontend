// utils/authAPI.js
import axiosInstance from "./axiosInstance";

export async function authAPI(method, endpoint, payload = {}, config = {}) {
  try {
    const response = await axiosInstance({
      method: method.toLowerCase(),
      url: endpoint,
      data: ["post", "put", "patch"].includes(method.toLowerCase()) ? payload : undefined,
      params: method.toLowerCase() === "get" ? payload : undefined,
      ...config,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
