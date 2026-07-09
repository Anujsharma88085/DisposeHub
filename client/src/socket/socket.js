import { io } from "socket.io-client";
import { showErrorToast } from "../utils/showErrorToast";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      if (import.meta.env.DEV) {
        console.log("✅ Socket connected:", socket.id);
      }
    });

    socket.on("connect_error", (err) => {
      if (import.meta.env.DEV) {
        console.error("❌ Socket error:", err);
      }
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) return connectSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};