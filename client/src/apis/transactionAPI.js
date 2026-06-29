import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fetchUserTransactions = async () => {
  const res = await api.get("/api/v1/transactions/my");
  return res.data.data.transactions;
};

export const withdrawMoney = async (formData) => {
  const res = await api.post(
    "/api/v1/wallet/withdraw",
    formData,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
};
