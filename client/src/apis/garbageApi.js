import api from "./api";

export const savePickupLocation = async (location) => {
  const res = await api.post("/api/v1/locations/save", location);
  return res.data;
};


export const getActiveLocations = async () => {
  const res = await api.get("/api/v1/locations/active-locations");
  return res.data;
};

export const getUserActiveLocation = async () => {
  try {
    const res = await api.get("/api/v1/locations/my-active-location");
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error
  }
};

export const getAllGarbageDumps = async () => {
  const res = await api.get("/api/v1/garbage/all");
  return res.data;
};

export const deactivateLocation = async (id) => {
  const res = await api.patch(`/api/v1/locations/${id}/deactivate`, {
    active: false,
  });
  return res.data;
};

export const cancelLocation = async (id) => {
  const res = await api.patch(`/api/v1/locations/${id}/cancel`);
  return res.data;
};
