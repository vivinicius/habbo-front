import axios from "axios";

const api = axios.create({
  baseURL: "https://habbo-api-production.up.railway.app",
});

// 🔐 INTERCEPTOR DO TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
