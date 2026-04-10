import axios from "axios";
import { supabase } from "@/lib/supabase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
});

/**
 * Phase D: JWT หมดอายุ / ไม่มีสิทธิ์ — ส่งไป login พร้อมกลับมาที่หน้าเดิมหลัง sign-in
 * ไม่ redirect บน /login, /register, /admin/login — ให้แต่ละหน้าแสดง error เอง
 * (แอดมินใช้คู่กับ `skipAuthRedirect` บน request สำคัญ — เผื่อมีหลาย request บนหน้าเดียวกัน)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    if (status !== 401) {
      return Promise.reject(error)
    }

    const path = window.location.pathname
    if (path === "/login" || path === "/register" || path === "/admin/login") {
      return Promise.reject(error)
    }

    const fullPath = path + window.location.search
    const redirect = encodeURIComponent(fullPath)
    window.location.assign(`${window.location.origin}/login?redirect=${redirect}`)
    return Promise.reject(error)
  },
);
