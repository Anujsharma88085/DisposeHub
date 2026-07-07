import { EVENTS } from "./events";

export const registerPickupListeners = (socket, { onCompleted }) => {
  socket.on(EVENTS.PICKUP_COMPLETED, onCompleted);

  return () => {
    socket.off(EVENTS.PICKUP_COMPLETED, onCompleted);
  };
};

export const registerDriverListeners = (
  socket,
  {
    onPickupCreated,
    onPickupUpdated,
    onPickupCompleted,
    onPickupCancelled,
  }
) => {
  socket.on(EVENTS.PICKUP_CREATED, onPickupCreated);
  socket.on(EVENTS.PICKUP_UPDATED, onPickupUpdated);
  socket.on(EVENTS.PICKUP_COMPLETED, onPickupCompleted);
  socket.on(EVENTS.PICKUP_CANCELLED, onPickupCancelled);

  return () => {
    socket.off(EVENTS.PICKUP_CREATED, onPickupCreated);
    socket.off(EVENTS.PICKUP_UPDATED, onPickupUpdated);
    socket.off(EVENTS.PICKUP_COMPLETED, onPickupCompleted);
    socket.off(EVENTS.PICKUP_CANCELLED, onPickupCancelled);
  };
};

export const registerNotificationListeners = (
  socket,
  {
    onNewNotification,
    onNotificationRead,
  }
) => {

  socket.on(
    EVENTS.NOTIFICATION_NEW,
    onNewNotification
  );

  socket.on(
    EVENTS.NOTIFICATION_READ,
    onNotificationRead
  );

  return () => {

    socket.off(
      EVENTS.NOTIFICATION_NEW,
      onNewNotification
    );

    socket.off(
      EVENTS.NOTIFICATION_READ,
      onNotificationRead
    );

  };

};