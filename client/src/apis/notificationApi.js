import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/api/v1/notifications");

  return response.data;
};

export const markNotificationsAsRead = async () => {
  const response = await api.patch("/api/v1/notifications/read");

  return response.data;
};