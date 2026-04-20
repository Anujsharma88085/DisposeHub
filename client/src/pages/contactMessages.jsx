import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/contact/admin/messages`, {
       withCredentials: true,
      });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : raw.messages;
      setMessages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };
  
  

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/contact/admin/messages/${id}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error("Error deleting message", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-black px-6 py-10 text-white">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        Contact Messages
      </motion.h1>

      <div className="overflow-x-auto max-w-6xl mx-auto">
        <table className="min-w-full bg-white/10 backdrop-blur-md rounded-xl border border-purple-700 text-sm">
          <thead className="bg-purple-700 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Message</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr
                key={msg._id}
                className="border-t border-purple-500 hover:bg-purple-900/20 transition"
              >
                <td className="py-3 px-4">{msg.user?.name || msg.name}</td>
                <td className="py-3 px-4">{msg.user?.email || msg.email}</td>
                <td className="py-3 px-4">{msg.role || "user"}</td>
                <td className="py-3 px-4">{msg.message}</td>
                <td className="py-3 px-4 text-center">
                  <Button
                    onClick={() => deleteMessage(msg._id)}
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-300">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
