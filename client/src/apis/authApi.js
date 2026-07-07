import api from "./api";

/* ================= SIGNUP ================= */
export const signupUser = async (userData) => {
  const res = await api.post("/api/v1/users/signup", userData);
  return res.data;
};

/* ================= LOGIN ================= */
export const loginUser = async (credentials) => {
  const res = await api.post("/api/v1/users/login", credentials);
  return res.data;
};

/* ================= LOGOUT ================= */
export const logoutUser = async () => {
  const res = await api.post("/api/v1/users/logout");
  return res.data;
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (email) => {
  const res = await api.post("/api/v1/users/forgotPassword", { email });
  return res.data;
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (token, passwords) => {
  const res = await api.patch(
    `/api/v1/users/resetPassword/${token}`,
    passwords
  );
  return res.data;
};