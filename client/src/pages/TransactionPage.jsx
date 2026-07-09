import { useEffect, useState } from 'react';
import { fetchUserTransactions } from '../apis/transactionAPI';
import TransactionList from '../components/Transaction/TransactionList';
import Rupee from "../assets/transactionPage-bg.jpeg";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from '../utils/showErrorToast';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const data = await fetchUserTransactions();
        setTransactions(data?.data?.transactions);
      } catch (err) {
        showErrorToast(err);

        if (import.meta.env.DEV) {
          console.error("Error fetching transactions", err);
        }
      }finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: `url(${Rupee})`,
      }}
    >
      <div className="w-full max-w-2xl bg-black/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">
          Your Transactions
        </h2>
        {loading ? (
          <p className="text-center text-white text-lg">
            Loading transactions...
          </p>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
