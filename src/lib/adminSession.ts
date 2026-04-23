import { supabase } from "@/lib/supabase";

/**
 * Fallback when Supabase session is not persisted yet (race) or setSession fails.
 * Same JWT as backend returns; cleared on student login / admin logout.
 */
const STORAGE_KEY = "courseflow.admin.accessToken";
const REFRESH_STORAGE_KEY = "courseflow.admin.refreshToken";

/** Persist access; optionally refresh so 401 handler can call setSession and renew JWT */
export function setAdminAccessTokenFallback(
  token: string,
  refreshToken?: string | null,
) {
  localStorage.setItem(STORAGE_KEY, token);
  if (refreshToken != null && String(refreshToken).trim() !== "") {
    localStorage.setItem(REFRESH_STORAGE_KEY, String(refreshToken).trim());
  } else {
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  }
}

export function clearAdminAccessTokenFallback() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(REFRESH_STORAGE_KEY);
}

export function getAdminAccessTokenFallback(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function getAdminRefreshTokenFallback(): string | null {
  return localStorage.getItem(REFRESH_STORAGE_KEY);
}

/** True if we can attach a Bearer token (Supabase session or admin fallback). */
export async function hasApiAuthToken(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) return true;
  return Boolean(getAdminAccessTokenFallback());
}

/**
 * Normalize POST /api/auth/admin-login body (Spring/axios may use snake_case, nested wrappers, or string JSON).
 * {@code refreshToken} may be absent (older backends); client can still use access-only fallback.
 */
export function parseAdminLoginTokens(raw: unknown): {
  accessToken: string;
  refreshToken: string | null;
} | null {
  let root: Record<string, unknown> | null = null;
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        root = parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  } else if (typeof raw === "object" && !Array.isArray(raw)) {
    root = raw as Record<string, unknown>;
  }
  if (!root) return null;

  const nested = root.data ?? root.result ?? root.payload;
  const src =
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : root;

  const asTokenString = (v: unknown): string => {
    if (v == null) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return "";
  };

  const pick = (...keys: string[]): string => {
    for (const k of keys) {
      const s = asTokenString(src[k]);
      if (s) return s;
    }
    return "";
  };

  const accessToken = pick("access_token", "accessToken");
  const refreshRaw = pick("refresh_token", "refreshToken");
  if (!accessToken) return null;
  return { accessToken, refreshToken: refreshRaw || null };
}
