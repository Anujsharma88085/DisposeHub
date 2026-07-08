import api from "./api";

export const getMe = async () => {
  try {
    const res = await api.get("/api/v1/users/me");
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      return null;
    }
    throw err;
  }
};


export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("profileImage", file);

  const res = await api.put(
    "/api/v1/users/upload-profile-photo",
    formData
  );

  return res.data;
};
  
export const updateUserProfile = async (updatedData) => {
  const res = await api.put(`/api/v1/users/update-profile`, updatedData);
  return res.data;
};

/* ================ UPDATE PASSWORD ============== */
export const updatePassword = async (passwordData) => {
  const res = await api.put(
    "/api/v1/users/update-password",
    passwordData
  );

  return res.data;
};
  