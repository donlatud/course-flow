import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const DEV_USER_ID = import.meta.env.VITE_DEV_ADMIN_USER_ID ?? "";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_user_id");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (import.meta.env.DEV && DEV_USER_ID) {
    config.headers.Authorization = `Bearer ${DEV_USER_ID}`;
  }

  return config;
});
