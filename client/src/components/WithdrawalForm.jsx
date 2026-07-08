import React, { useState } from 'react';
import { toast } from "react-toastify";

const WithdrawalForm = ({ onSubmit, onCancel}) => {
  const [formData, setFormData] = useState({
    name: '',
    account: '',
    confirmAccount: '',
    ifsc: '',
    bank: '',
    amount: 0,
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.account !== formData.confirmAccount) {
      toast.warning("Account numbers do not match.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/50 backdrop-blur-md p-6 rounded-2xl space-y-4 shadow-xl"
    >
      {[
        { name: 'name', placeholder: 'Account Holder Name', type: 'text' },
        { name: 'amount', placeholder: 'Amount', type: 'number' },
        { name: 'account', placeholder: 'Account Number', type: 'text' },
        { name: 'confirmAccount', placeholder: 'Confirm Account Number', type: 'text' },
        { name: 'ifsc', placeholder: 'IFSC Code', type: 'text' },
        { name: 'bank', placeholder: 'Bank Name', type: 'text' },
      ].map(({ name, placeholder, type }) => (
        <input
          key={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      ))}

      <div className="flex justify-between mt-4">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default WithdrawalForm;
