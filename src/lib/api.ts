import axios from "axios";
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

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  let token = data.session?.access_token;
  if (!token) {
    token = getAdminAccessTokenFallback() ?? undefined;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** 401 from API: clear stale admin fallback so user can re-login */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    if (status === 401) {
      clearAdminAccessTokenFallback();
    }
    return Promise.reject(err);
  },
);