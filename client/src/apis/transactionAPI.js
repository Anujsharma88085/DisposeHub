import api from "./api";

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

export const fetchAllTransactions = async () => {
  const res = await api.get('/api/v1/transactions');
  return res.data;
}
