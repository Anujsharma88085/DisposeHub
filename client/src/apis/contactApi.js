import api from "./api";

export const getContactStatus = async () => {
  const res = await api.get("/api/v1/contact/status");
  return res.data;
};

export const sendContactMessage = async (message) => {
  const res = await api.post("/api/v1/contact", { message });
  return res.data;
};

export const getAllContactMessages = async () => {
  const res = await api.get('/api/v1/contact/admin/messages');
  return res.data;
}

export const deleteContactMessage = async (id) => {
  const res = api.delete(`/api/v1/contact/admin/messages/${id}`);
  return res.data;
}