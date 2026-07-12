// services/authService.js
import axios from "axios";
import { normalizeEmailFields } from "../utils/normalizationUtils";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



export function getToken() {
  return sessionStorage.getItem("token");
}

export function getHospitalToken() {
  return sessionStorage.getItem("hospital_token");
}

export function getRole() {
  return sessionStorage.getItem("role");
}
export function getHospitalRole() {
  return sessionStorage.getItem("hospital_role");
}

export function setToken(token, role) {
  if (token) {
    // console.log(role)
    sessionStorage.setItem("token", token);
  }
  if (role) {
    sessionStorage.setItem("role", role);
  }
}

export function setHospitalToken(token, role) {
  if (token) {
    // console.log(role)
    sessionStorage.setItem("hospital_token", token);
  }
  if (role) {
    sessionStorage.setItem("hospital_role", role);
  }
}

// Login
export async function login(userData) {
  const normalizedData = normalizeEmailFields(userData);
  const response = await axios.post(`${API_BASE_URL}api/auth/login`, normalizedData, {
    withCredentials: true,
  });
  const data = response.data;
  return data;
}

export function setSubscriptionStatus(subscription){
  if (subscription) {
    sessionStorage.setItem("subscription", JSON.stringify(subscription));
  } else {
    sessionStorage.removeItem("subscription");
  }
}

export function fetchSubscriptionStatus(){
  const subscription = sessionStorage.getItem("subscription");
  return subscription !== null && subscription !== "undefined" && subscription !== "null";
}

export function getSubscriptionDetails(){
  const subscriptionStr = sessionStorage.getItem("subscription");
  if (!subscriptionStr || subscriptionStr === "null" || subscriptionStr === "undefined") return null;
  try {
    return JSON.parse(subscriptionStr);
  } catch (e) {
    return null;
  }
}
// Refresh
export async function refreshToken() {
  const savedToken = getToken();
  try {
    const response = await axios.post(`${API_BASE_URL}api/auth/refresh`, null, {
      withCredentials: true,
      headers: {
        Authorization: savedToken ? `Bearer ${savedToken}` : undefined,
      },
    });

    const data = response.data?.data;
    if (data?.access_token) {
      setToken(data.access_token, data.role);
    }
    return data;
  } catch (error) {
    console.error(
      "Refresh token failed:",
      error.response?.data || error.message,
    );

    // optional: clear token if refresh fails
    setToken(null);

    // rethrow so the caller can handle it
    throw error;
  }
}

export async function refreshHospitalToken() {
  const savedToken = getHospitalToken();

  try {
    const response = await axios.post(`${API_BASE_URL}api/auth/refresh`, null, {
      withCredentials: true,
      headers: {
        Authorization: savedToken ? `Bearer ${savedToken}` : undefined,
      },
    });
    const data = response.data?.data;
    if (data?.access_token) {
      setHospitalToken(data.access_token, data.role);
    }
    return data;
  } catch (error) {
    console.error(
      "Refresh token failed:",
      error.response?.data || error.message,
    );

    // optional: clear token if refresh fails
    setHospitalToken(null);

    // rethrow so the caller can handle it
    throw error;
  }
}

