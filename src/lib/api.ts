import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const DEV_USER_ID = import.meta.env.VITE_DEV_ADMIN_USER_ID ?? "22222222-2222-2222-2222-222222222222";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (import.meta.env.DEV && DEV_USER_ID) {
    config.headers.Authorization = `Bearer ${DEV_USER_ID}`;
  }
  return config;
});
