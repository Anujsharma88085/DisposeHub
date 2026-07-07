import React, { useState, useEffect } from 'react';
import WithdrawalForm from './WithdrawalForm';
import WalletBg from '../assets/transactionPage-bg.jpeg';
import { getMe } from '../apis/userApi';
import { withdrawMoney } from '../apis/transactionAPI';
import { useDispatch } from "react-redux";
import { updateWallet } from "../redux/slices/authSlice";

export const Wallet = () => {
  const MIN_WITHDRAWAL = Number(import.meta.env.VITE_MIN_WITHDRAWAL) || 50;
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [balance, setBalance] = useState(0);
  const [withdrawRequest, setWithdrawRequest] = useState(false);

  const handleWithdrawClick = () => setIsFormVisible(true);
  const handleCancel = () => setIsFormVisible(false);

  const dispatch = useDispatch();

  const handleFormSubmit = async (formData) => {
    setWithdrawRequest(true);
    setIsFormVisible(false);

    try {
      const res = await withdrawMoney(formData);
      setBalance(res.walletBalance);
      dispatch(updateWallet(res.walletBalance));
    } catch (err) {
      console.error("Withdrawal failed", err);
      alert("Withdrawal failed");
    } finally {
      setWithdrawRequest(false);
    }
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const user = await getMe();
        setBalance(user.walletBalance);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchWalletBalance();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-10"
      style={{ backgroundImage: `url(${WalletBg})` }}
    >
      <div className="w-full max-w-xl bg-black/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl text-center text-white">
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">💰 Your Wallet</h2>
        <p className="text-lg text-gray-300 mb-6">
          Balance: <span className="text-cyan-300 font-bold text-xl">{withdrawRequest ?  'processing ...' : `₹${balance}`}</span>
        </p>

        <button
          onClick={handleWithdrawClick}
          disabled={balance < MIN_WITHDRAWAL}
          className={`transition text-white py-2 px-4 rounded-xl font-semibold cursor-pointer ${
            balance >= MIN_WITHDRAWAL
              ? 'bg-cyan-500 hover:bg-cyan-600'
              : 'bg-gray-500 cursor-not-allowed'
          }`}
        >
          Withdraw Money
        </button>

        {/* Show minimum withdrawal info if balance is low */}
        {balance < MIN_WITHDRAWAL && (
          <p className="text-sm text-gray-400 mt-2">
            Minimum withdrawal amount is ₹{MIN_WITHDRAWAL}
          </p>
        )}

        {isFormVisible && (
          <div className="mt-8">
            <WithdrawalForm 
              onSubmit={handleFormSubmit} 
              onCancel={handleCancel} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
