import api from "./api";

export const getMe = async () => {
  try {
    const res = await api.get("/api/v1/users/me");
    return res.data.data.data;
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
    const response = await fetch(`${API_BASE_URL}/api/v1/users/upload-profile-photo`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error("Upload failed!");
    }
  
    return await response.json();
  };
  
  export const updateUserProfile = async (updatedData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/update-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error("Failed to update profile.");
    }
  
    return await response.json();
  };
  