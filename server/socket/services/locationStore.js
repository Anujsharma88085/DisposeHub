const liveLocations = new Map();

export const updateLocation = ({ userId, latitude, longitude }) => {
  liveLocations.set(userId, {
    userId,
    latitude,
    longitude,
    updatedAt: Date.now(),
  });
};

export const getLocation = (userId) => {
  return liveLocations.get(userId);
};

export const getAllLocations = () => {
  return [...liveLocations.values()];
};


export const removeLocation = (userId) => {
  liveLocations.delete(userId);
};

export const clearLocations = () => {
  liveLocations.clear();
};