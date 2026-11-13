import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/env";
import { type NextStep, useAuthStore } from "@/stores/auth-store";

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RefreshResponse {
  access_token?: string;
  access?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: {
    access_token?: string;
    access?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

// One refresh at a time: concurrent 401s wait on the same promise.
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { session, setTokens } = useAuthStore.getState();
  if (!session) throw new Error("No session to refresh");

  const { data } = await axios.post<RefreshResponse>(
    `${env.VITE_API_URL}/api/auth/refresh`,
    session.refreshToken ? { refreshToken: session.refreshToken } : {},
    { withCredentials: true },
  );

  const payload = data.data ?? data;
  const accessToken = payload.access_token ?? payload.access ?? payload.accessToken;
  if (!accessToken) {
    throw new Error("Refresh response did not include an access token");
  }

  setTokens({
    accessToken,
    refreshToken: payload.refreshToken ?? session.refreshToken,
  });
  return accessToken;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

interface GateErrorPayload {
  code?: string;
  error?: { code?: string };
}

http.interceptors.response.use(undefined, async (error: AxiosError<GateErrorPayload>) => {
  const status = error.response?.status;
  if (status === 403) {
    const code = error.response?.data?.code ?? error.response?.data?.error?.code;
    if (code === "nin_not_verified" || code === "admin_details_required") {
      useAuthStore.getState().setNextStep(code satisfies NextStep);
    }
  }

  const config = error.config as RetriableConfig | undefined;
  const isAuthCall = config?.url?.startsWith("/auth/") || config?.url?.startsWith("/api/auth/");

  if (status !== 401 || !config || config._retried || isAuthCall) {
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
