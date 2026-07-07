import api from "./api";

export const getContactStatus = async () => {
  const res = await api.get("/api/v1/contact/status");
  return res.data;
};

export const sendContactMessage = async (message) => {
  const res = await api.post("/api/v1/contact", { message });
  return res.data;
};