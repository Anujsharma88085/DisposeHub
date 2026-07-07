import { EVENTS } from "../constants/events.js";
import { updateLocation } from "../services/locationStore.js";
import {
  emitUserLocationChanged,
  emitDriverLocationChanged,
} from "../services/socketEmitter.js";

const registerLocationHandlers = (io, socket) => {
  socket.on(EVENTS.LOCATION_UPDATE, ({ lat, lng }) => {
    const location = {
      userId: socket.user.id,
      latitude: lat,
      longitude: lng,
      updatedAt: Date.now(),
    };

    updateLocation(location);

    if (socket.user.role === "driver") {
      emitDriverLocationChanged(location);
    } else {
      emitUserLocationChanged(location);
    }
  });
};

export default registerLocationHandlers;