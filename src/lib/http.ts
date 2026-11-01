import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/env";
import { useAuthStore } from "@/stores/auth-store";

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One refresh at a time: concurrent 401s wait on the same promise.
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { session, setTokens } = useAuthStore.getState();
  if (!session) throw new Error("No session to refresh");

  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${env.VITE_API_URL}/auth/refresh`,
    { refreshToken: session.refreshToken },
  );
  setTokens(data);
  return data.accessToken;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  const isAuthCall = config?.url?.startsWith("/auth/");

  if (error.response?.status !== 401 || !config || config._retried || isAuthCall) {
    throw error;
  }

  try {
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const token = await refreshing;
    config._retried = true;
    config.headers.Authorization = `Bearer ${token}`;
    return http(config);
  } catch {
    useAuthStore.getState().clearSession();
    throw error;
  }
});
