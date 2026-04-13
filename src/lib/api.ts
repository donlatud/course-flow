import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { supabase } from "@/lib/supabase";
import {
  clearAdminAccessTokenFallback,
  getAdminAccessTokenFallback,
} from "@/lib/adminSession";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type ApiRequestConfig = InternalAxiosRequestConfig & { skipAuthRedirect?: boolean };

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

/** Supabase session → admin localStorage fallback → refreshSession (แอดมิน / race หลัง login) */
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

/**
 * Phase D: JWT หมดอายุ / ไม่มีสิทธิ์ — ส่งไป login พร้อมกลับมาที่หน้าเดิมหลัง sign-in
 * ไม่ redirect บน /login, /register, /admin/login — ให้แต่ละหน้าแสดง error เอง
 * (แอดมินใช้คู่กับ `skipAuthRedirect` บน request สำคัญ — เผื่อมีหลาย request บนหน้าเดียวกัน)
 *
 * ก่อน redirect: ลอง `refreshSession()` แล้ว retry request หนึ่งครั้ง — ลดการเด้ง login บ่อย
 * เมื่อ access token หมดอายุแต่ refresh token ยังใช้ได้ (Navbar ยังโชว์ชื่อเพราะ session ใน Supabase ยังอยู่)
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    if (status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RequestWithAuthRetry | undefined
    if (originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession()
      const newToken = refreshed.session?.access_token
      if (!refreshErr && newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api.request(originalRequest)
      }
    }

    const originalRequest = error.config as RequestWithAuthRetry | undefined
    if (originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession()
      const newToken = refreshed.session?.access_token
      if (!refreshErr && newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api.request(originalRequest)
      }
    }

    const ax = error as {
      config?: ApiRequestConfig;
      response?: { status?: number };
    };
    const config = ax.config;
    const url = String(config?.url ?? "");

    if (url.includes("/api/auth/")) {
      clearAdminAccessTokenFallback();
      return Promise.reject(error);
    }

    if (config?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    const path = window.location.pathname;
    if (path === "/login" || path === "/register" || path === "/admin/login") {
      return Promise.reject(error);
    }

    const fullPath = path + window.location.search;
    const redirect = encodeURIComponent(fullPath);
    const loginPath = path.startsWith("/admin") ? "/admin/login" : "/login";
    window.location.assign(`${window.location.origin}${loginPath}?redirect=${redirect}`);
    return Promise.reject(error);
  },
);
