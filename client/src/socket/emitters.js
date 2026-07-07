import { getSocket } from "./socket";
import { EVENTS } from "./events";

export const emitLocationUpdate = ({lat, lng}) => {
  const socket = getSocket();

  if (!socket.connected) return;
  
  socket.emit(EVENTS.LOCATION_UPDATE, {
    lat,
    lng,
  });
};