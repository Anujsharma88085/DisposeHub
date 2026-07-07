const connectedUsers = new Map();

export const addSocket = ({ userId, socketId, role }) => {
  connectedUsers.set(userId, {
    userId,
    socketId,
    role,
  });
};

export const removeSocket = (userId) => {
  connectedUsers.delete(userId);
};

export const getSocket = (userId) => {
  return connectedUsers.get(userId);
};

export const isOnline = (userId) => {
  return connectedUsers.has(userId);
};

export const getAllDrivers = () => {
  return [...connectedUsers.values()].filter(
    (user) => user.role === "driver"
  );
};

export const getAllUsers = () => {
  return [...connectedUsers.values()].filter(
    (user) => user.role === "user"
  );
};

export const clearSockets = () => {
  connectedUsers.clear();
};