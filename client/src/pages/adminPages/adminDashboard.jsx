import React, { useEffect, useState } from "react";
import { getMe } from "../../apis/userApi";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import { deepPurple } from "@mui/material/colors";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-900 to-gray-900">
        <CircularProgress sx={{ color: "#fff" }} />
      </div>
    );
  }

  const AdminCard = ({ title, description, link, buttonLabel, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md border border-purple-500 rounded-3xl shadow-xl hover:shadow-purple-300 p-8 flex flex-col items-center text-center h-80"
    >
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-sm text-white mb-6">{description}</p>
      <Link to={link}>
        <Button
          variant="contained"
          sx={{
            borderRadius: "999px",
            px: 4,
            py: 1,
            textTransform: "none",
            bgcolor: "#9C27B0",
            "&:hover": {
              bgcolor: "#7B1FA2",
            },
          }}
        >
          {buttonLabel}
        </Button>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center bg-gradient-to-br from-purple-950 to-black text-white">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-300">
          Welcome back, {user.name}! Here's an overview of your admin tools.
        </p>
      </motion.div>

      {/* Top Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border border-purple-400 p-8 flex flex-col items-center text-center"
        >
          <Avatar
            src={user.profilePicture || "https://i.pravatar.cc/100"}
            sx={{ width: 120, height: 120, bgcolor: deepPurple[500], mb: 3 }}
          />
          <h2 className="text-2xl font-semibold">{user.name}</h2>
          <p className="text-sm bg-purple-600/40 text-white px-4 py-1 rounded-full mt-2 shadow-md">
            {user.role.toUpperCase()}
          </p>
          <p className="text-sm text-white mt-4 max-w-sm">
            You have administrative privileges. Use the tools below to manage users, view transactions, and update content.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border border-purple-400 p-8 text-white flex flex-col justify-between"
        >
          <div className="space-y-4 text-lg">
            <div className="flex justify-between">
              <span className="font-medium">Users:</span>
              <span className="font-bold text-purple-300">Manage All</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Transactions:</span>
              <span className="font-bold text-purple-300">View Records</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reports:</span>
              <span className="font-bold text-purple-300">Generate PDF</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Wallet Balance:</span>
              <span className="font-bold text-purple-300">₹{user.walletBalance}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <AdminCard
          title="Manage Users"
          description="View, update, or remove users from the platform."
          link="/admin/users"
          buttonLabel="Users"
        />
        <AdminCard
          title="Transaction History"
          description="Track every wallet transaction and user activity."
          link="/admin/transactions"
          buttonLabel="Transactions"
          delay={0.2}
        />
        <AdminCard
          title="Update Content"
          description="Modify platform banners, texts, and settings."
          link="/admin/settings"
          buttonLabel="Settings"
          delay={0.4}
        />
      </div>

      {/* Bottom Buttons */}
      <div className="mt-10 flex gap-4">
        <Link to="/profile">
          <Button variant="outlined" sx={{ borderColor: "#9C27B0", color: "#9C27B0" }}>
            Edit Profile
          </Button>
        </Link>
        <Link to="/admin/contact-messages">
          <Button variant="outlined" sx={{ borderColor: "#9C27B0", color: "#9C27B0" }}>
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
