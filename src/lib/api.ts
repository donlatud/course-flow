import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { supabase } from "@/lib/supabase";
import {
  clearAdminAccessTokenFallback,
  getAdminAccessTokenFallback,
} from "@/lib/adminSession";

/**
 * Empty base URL → requests are same-origin (e.g. Vite dev: `/api` → proxy to backend).
 * Set `VITE_API_BASE_URL` (e.g. `http://localhost:8080`) only when you need a fixed API host.
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (raw === undefined || raw === null) return "";
  return String(raw).trim();
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

function setBearer(
  config: InternalAxiosRequestConfig,
  token: string | undefined,
): void {
  if (!token) return;
  const h = config.headers;
  if (h && typeof (h as { set?: (a: string, b: string) => void }).set === "function") {
    (h as { set: (a: string, b: string) => void }).set("Authorization", `Bearer ${token}`);
  } else {
    type HeadersRecord = { Authorization?: string };
    (config.headers as HeadersRecord).Authorization = `Bearer ${token}`;
  }
}

/** Resolve access token: Supabase session → localStorage fallback → refreshSession */
async function resolveAccessToken(): Promise<string | undefined> {
  const { data: s1 } = await supabase.auth.getSession();
  let token = s1.session?.access_token;
  if (token) return token;

  token = getAdminAccessTokenFallback() ?? undefined;
  if (token) return token;

  const { data: s2 } = await supabase.auth.refreshSession();
  return s2.session?.access_token ?? undefined;
}

api.interceptors.request.use(async (config) => {
  const token = await resolveAccessToken();
  setBearer(config, token);
  return config;
});

/** On 401: retry once after refreshSession (fixes expired JWT during long admin flows / uploads). */
api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    const ax = err as {
      config?: InternalAxiosRequestConfig & { _retry?: boolean };
      response?: { status?: number };
    };
    const status = ax.response?.status;
    const config = ax.config;
    const url = String(config?.url ?? "");
    if (url.includes("/api/auth/")) {
      if (status === 401) clearAdminAccessTokenFallback();
      return Promise.reject(err);
    }
    if (status === 401 && config && !config._retry) {
      config._retry = true;
      const { data } = await supabase.auth.refreshSession();
      const token = data.session?.access_token ?? getAdminAccessTokenFallback() ?? undefined;
      if (token) {
        setBearer(config, token);
        return api.request(config);
      }
    }
    if (status === 401) {
      clearAdminAccessTokenFallback();
    }
    return Promise.reject(err);
  },
);