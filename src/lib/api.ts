import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { supabase } from "@/lib/supabase";
import {
  clearAdminAccessTokenFallback,
  getAdminAccessTokenFallback,
  getAdminRefreshTokenFallback,
} from "@/lib/adminSession";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRedirect?: boolean;
  /** Set after one refresh+retry so we do not loop */
  _retryAfter401?: boolean;
};

/** Single in-flight refresh so parallel 401s do not stampede Supabase */
let refreshAccessTokenPromise: Promise<string | undefined> | null = null;

async function refreshAccessTokenOnce(): Promise<string | undefined> {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = (async () => {
      const { data: r1, error: e1 } = await supabase.auth.refreshSession();
      if (!e1 && r1.session?.access_token) {
        return r1.session.access_token;
      }

      const access = getAdminAccessTokenFallback();
      const refresh = getAdminRefreshTokenFallback();
      if (access && refresh) {
        const { data: r2, error: e2 } = await supabase.auth.setSession({
          access_token: access,
          refresh_token: refresh,
        });
        if (!e2 && r2.session?.access_token) {
          clearAdminAccessTokenFallback();
          return r2.session.access_token;
        }
      }

      return undefined;
    })().finally(() => {
      refreshAccessTokenPromise = null;
    });
  }
  return refreshAccessTokenPromise;
}

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
 * Phase D: JWT หมดอายุ — ลอง refresh (รวมศูนย์) แล้ว retry request หนึ่งครั้งก่อน
 * ถ้ายัง 401 / refresh ไม่ได้ — ส่งไป login พร้อมกลับมาที่หน้าเดิมหลัง sign-in
 * ไม่ redirect บน /login, /register, /admin/login — ให้แต่ละหน้าแสดง error เอง
 * `skipAuthRedirect`: ไม่ทำ window.location แต่ยัง refresh+retry ได้ (เช่น router guard)
 */
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const ax = error as {
      config?: ApiRequestConfig & { _authRetry?: boolean };
      response?: { status?: number };
    };
    const status = ax.response?.status;
    if (status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = ax.config;
    if (originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true;
      const { data: refreshed, error: refreshErr } =
        await supabase.auth.refreshSession();
      const newToken = refreshed.session?.access_token;
      if (!refreshErr && newToken) {
        (originalRequest.headers as { Authorization?: string }).Authorization =
          `Bearer ${newToken}`;
        return api.request(originalRequest);
      }
    }

    const config = ax.config;
    if (!config) {
      return Promise.reject(error);
    }

    const url = String(config.url ?? "");

    if (url.includes("/api/auth/")) {
      clearAdminAccessTokenFallback();
      return Promise.reject(error);
    }

    if (!config._retryAfter401) {
      const newToken = await refreshAccessTokenOnce();
      if (newToken) {
        config._retryAfter401 = true;
        setBearer(config, newToken);
        try {
          return await api.request(config);
        } catch (retryErr) {
          return Promise.reject(retryErr);
        }
      }
    }

    if (config.skipAuthRedirect) {
      return Promise.reject(error);
    }

    const path = window.location.pathname;
    if (path === "/login" || path === "/register" || path === "/admin/login") {
      return Promise.reject(error);
    }

    clearAdminAccessTokenFallback();

    const fullPath = path + window.location.search;
    const redirect = encodeURIComponent(fullPath);
    const loginPath = path.startsWith("/admin") ? "/admin/login" : "/login";
    window.location.assign(`${window.location.origin}${loginPath}?redirect=${redirect}`);
    return Promise.reject(error);
  },
);
