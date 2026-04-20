import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// save pickup location
export const savePickupLocation = async (location) => {
  try {
    const response = await api.post("/location/save", location);

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to save pickup location"
    );
  }
};

// get active locations
export const getActiveLocations = async () => {
  try {
    const res = await api.get("/location/active-locations");

    return res.data.locations || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active locations"
    );
  }
};

export const getUserActiveLocation = async () => {
  try {
    const res = await api.get("/location/my-active-location");
    return res.data.location || null;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No active location found
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch your active location"
    );
  }
};

export const getAllGarbageDumps = async () => {
  try {
    const res = await api.get("/garbage/all");
    return res.data.data || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch garbage dumps"
    );
  }
};

export const deactivateLocation = async (id) => {
  try {
    const res = await api.patch(`/location/${id}/deactivate`, {
      active: false,
    });
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to deactivate location"
    );
  }
};
