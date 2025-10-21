// services/authService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getToken() {
  return sessionStorage.getItem("token");
}

export function getRole(){
  return sessionStorage.getItem("role");
}

export function setToken(token,role) {
  if (token) {
    // console.log(role)
    sessionStorage.setItem("token", token);
  }
  if(role){
    sessionStorage.setItem("role", role)
  }
}

// Login
export async function login(userData) {
  const response = await axios.post(`${API_BASE_URL}api/auth/login`, userData, {
    withCredentials: true,
  });
  const data = response.data;
  // console.log(data)
  // console.log(data.data.role)

  return data;
}

// Refresh
export async function refreshToken() {
  const savedToken = getToken();
  try {
    const response = await axios.post(
      `${API_BASE_URL}api/auth/refresh`,
      null,
      {
        withCredentials: true,
        headers: {
          Authorization: savedToken ? `Bearer ${savedToken}` : undefined,
        },
      }
    );

    const data = response.data?.data;
    if (data?.access_token) {
      setToken(data.access_token, data.role);
    }
    return data;
  } catch (error) {
    console.error("Refresh token failed:", error.response?.data || error.message);

    // optional: clear token if refresh fails
    setToken(null);

    // rethrow so the caller can handle it
    throw error;
  }
}



// Logout
export async function logout() {
  await axios.post(`${API_BASE_URL}api/auth/logout`, {}, { withCredentials: true });
  setToken(null);
}
