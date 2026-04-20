import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/transactions/`, {
        withCredentials: true,
      });
      setTransactions(res.data.data.transactions);
    } catch (err) {
      console.error("Error fetching transactions", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black px-6 py-10 text-white">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        All Transactions
      </motion.h1>

      <div className="overflow-x-auto max-w-6xl mx-auto">
        <table className="min-w-full bg-white/10 backdrop-blur-md rounded-xl border border-gray-700 text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Amount</th>
              <th className="py-3 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx._id}
                className="border-t border-gray-600 hover:bg-gray-800/20 transition"
              >
                <td className="py-3 px-4">{tx.user?.name || 'N/A'}</td>
                <td className="py-3 px-4">{tx.user?.email || 'N/A'}</td>
                <td className="py-3 px-4 capitalize">{tx.type}</td>
                <td className="py-3 px-4">
                  {tx.amount.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </td>
                <td className="py-3 px-4">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-300">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
