import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const getContactStatus = async () => {
  const res = await api.get("/api/v1/contact/status");
  return res.data;
};

export const sendContactMessage = async (message) => {
  const res = await api.post("/api/v1/contact", { message });
  return res.data;
};