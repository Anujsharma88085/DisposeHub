import { getIO } from "./io.js";
import {
  getAllDrivers,
  getAllUsers,
  getSocket,
} from "./socketStore.js";

import { EVENTS } from "../constants/events.js";

const io = () => getIO();

/* -------------------- Generic Emitters -------------------- */

const emitToSocket = (socketId, event, payload) => {
  io().to(socketId).emit(event, payload);
};

const emitToGroup = (connections, event, payload) => {
  connections.forEach(({ socketId }) => {
    emitToSocket(socketId, event, payload);
  });
};

/* -------------------- Location -------------------- */

export const emitUserLocationChanged = (location) => {
  emitToGroup(
    getAllDrivers(),
    EVENTS.USER_LOCATION_CHANGED,
    location
  );
};

export const emitDriverLocationChanged = (location) => {
  emitToGroup(
    getAllUsers(),
    EVENTS.DRIVER_LOCATION_CHANGED,
    location
  );
};

/* -------------------- Pickup -------------------- */

export const emitPickupCreated = (location) => {
  emitToGroup(getAllDrivers(), EVENTS.PICKUP_CREATED, {
    id: location._id,
    lat: location.lat,
    lng: location.long,
    long: location.long,
    locationName: location.locationName,
    userId: location.markedBy,
    updatedAt: location.updatedAt,
  });
};

export const emitPickupUpdated = (location) => {
  emitToGroup(getAllDrivers(), EVENTS.PICKUP_UPDATED, {
    id: location._id,
    lat: location.lat,
    lng: location.long,
    long: location.long,
    locationName: location.locationName,
    userId: location.markedBy,
    updatedAt: location.updatedAt,
  });
};

export const emitPickupCancelled = (location) => {
  const payload = {
    id: location._id,
  };

  emitToGroup(
    getAllDrivers(),
    EVENTS.PICKUP_CANCELLED,
    payload
  );

  const user = getSocket(location.markedBy.toString());

  if (user) {
    emitToSocket(
      user.socketId,
      EVENTS.PICKUP_CANCELLED,
      payload
    );
  }
};

export const emitPickupCompleted = (location) => {
  const payload = {
    id: location._id,
  };

  // Remove marker from all drivers
  emitToGroup(
    getAllDrivers(),
    EVENTS.PICKUP_COMPLETED,
    payload
  );

  // Remove marker from the user who created it
  const user = getSocket(location.markedBy.toString());

  if (user) {
    emitToSocket(
      user.socketId,
      EVENTS.PICKUP_COMPLETED,
      payload
    );
  }
};

/* -------------------- Notification -------------------- */

export const emitNotification = (userId, payload) => {
  const user = getSocket(userId);

  if (!user) return;

  emitToSocket(
    user.socketId,
    EVENTS.NOTIFICATION_NEW,
    payload
  );
};

/* -------------------- Leaderboard -------------------- */

export const emitLeaderboard = () => {
  io().emit(EVENTS.LEADERBOARD_UPDATE);
};