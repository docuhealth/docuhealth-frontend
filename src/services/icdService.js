import axios from "axios";

const TOKEN_ENDPOINT = import.meta.env.VITE_ICD_TOKEN_ENDPOINT;
const API_BASE_URL = import.meta.env.VITE_ICD_API_BASE_URL;

const CLIENT_ID = import.meta.env.VITE_ICD_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_ICD_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("scope", "icdapi_access");

  try {
    const response = await axios.post(TOKEN_ENDPOINT, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    accessToken = response.data.access_token;
    // Set expiry (default is 3600s, let's subtract a buffer)
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return accessToken;
  } catch (error) {
    console.error("Error fetching ICD-11 token:", error);
    throw error;
  }
};

export const searchICD11 = async (query) => {
  if (!query || query.length < 3) return [];

  const token = await getAccessToken();
  
  try {
    // Using the latest linearization for MMS (Mortality and Morbidity Statistics)
    const response = await axios.get(`${API_BASE_URL}/icd/release/11/2024-01/mms/search`, {
      params: {
        q: query,
      },
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "API-Version": "v2",
        "Accept-Language": "en"
      }
    });

    // The results are in destinationEntities according to ICD-API documentation
    return response.data.destinationEntities || [];
  } catch (error) {
    console.error("Error searching ICD-11:", error);
    return [];
  }
};
