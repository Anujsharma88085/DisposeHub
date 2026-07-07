import { EVENTS } from "./constants/events.js";
import setupSocketAuth from "./auth.js";
import registerHandlers from "./registerHandlers.js";
import { setIO } from "./services/io.js";

import {
  addSocket,
  removeSocket,
} from "./services/socketStore.js";

import {
  removeLocation,
} from "./services/locationStore.js";

const initializeSocket = (io) => {

  setIO(io);
  
  setupSocketAuth(io);

  io.on(EVENTS.CONNECT, (socket) => {
    console.log(`✅ Socket Connected: ${socket.id}`);

    addSocket({
      userId: socket.user.id,
      socketId: socket.id,
      role: socket.user.role,
    });

    registerHandlers(io, socket);

    socket.on(EVENTS.DISCONNECT, () => {
      console.log(`❌ Socket Disconnected: ${socket.id}`);

      removeSocket(socket.user.id);
      removeLocation(socket.user.id);
    });
  });
};

export default initializeSocket;