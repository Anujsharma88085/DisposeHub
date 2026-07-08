import React, { useEffect, useState } from "react";
import { getMe } from "../../apis/userApi";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import { deepPurple } from "@mui/material/colors";
import { useSelector } from "react-redux";
import defaultProfilePhoto from '../../assets/images/default-profile.png'

export default function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);

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
    
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-lg text-gray-300">
        Welcome back, {user.name}!
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border border-purple-400 p-8 flex flex-col items-center text-center max-w-md w-full mb-12"
    >
      <Avatar
        src={user.profilePicture || defaultProfilePhoto}
        sx={{ width: 100, height: 100, mb: 3 }}
      />
      <h2 className="text-2xl font-semibold">{user.name}</h2>

      <p className="text-sm bg-purple-600/40 px-4 py-1 rounded-full mt-2">
        {user.role.toUpperCase()}
      </p>

      <p className="text-sm mt-4 max-w-sm">
        You have administrative privileges. Use the tools below to manage users, view transactions, and update content.
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      
      <AdminCard
        title="Transaction History"
        description="Track every wallet transaction and user activity."
        link="/admin/transactions"
        buttonLabel="Transactions"
      />

      <AdminCard
        title="Contact Support"
        description="View and respond to user queries and messages."
        link="/admin/contact-messages"
        buttonLabel="Support"
        delay={0.2}
      />

      <AdminCard
        title="Edit Profile"
        description="Manage your profile details, profile picture, and account settings."
        link="/editProfile"
        buttonLabel="Edit Profile"
      />

    </div>
  </div>
);
}
