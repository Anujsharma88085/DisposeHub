import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { deepPurple } from "@mui/material/colors";
import defaultProfile from "../../assets/images/default-profile.png";

export default function UserDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  const renderUserSections = () => (
    <div className="min-h-screen flex flex-col items-center py-12 px-6">
      {/* First Row - Profile & Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 flex flex-col items-center justify-center border border-purple-400 hover:shadow-purple-200 h-80"
        >

          <div className="flex flex-col items-center">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-400 shadow-[0_0_25px_rgba(156,39,176,0.6)]">
              <img
                src={user?.profilePicture || defaultProfile}
                alt="Profile"
                className="w-full h-full object-cover object-center scale-150"
              />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-sm font-semibold bg-purple-700/30 text-white px-4 py-1 rounded-full mt-2 shadow-sm">
            {user.role}
          </p>
          <p className="text-xs text-white mt-4 text-center">
            This is your public profile info. Make sure it's up to date so
            others can recognize your role.
          </p>
        </motion.div>

        {/* Points and Wallet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-purple-400 hover:shadow-purple-200 h-80 flex flex-col justify-between"
        >
          <div className="space-y-6 text-base text-white">
            <h3 className="text-xl font-bold mb-2 text-center">
              Your Achievements
            </h3>
            <div className="flex justify-between">
              <span className="font-medium">Points Earned:</span>
              <span className="font-bold text-purple-300">{user.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Wallet Balance:</span>
              <span className="font-bold text-purple-300">
                ₹{user.walletBalance}
              </span>
            </div>
            <p className="text-sm mt-4 text-center">
              These reflect your contribution and rewards in the community.
            </p>
          </div>

          {/* All Transactions Button */}
          <div className="mt-4 text-center">
            <Link to="/transactions">
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
                All Transactions
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Second Row - Edit Profile & Find Dustbins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full max-w-5xl">
        {/* Edit Profile Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-purple-400 hover:shadow-purple-200 h-80 flex flex-col justify-center items-center text-center"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Update Your Profile
          </h3>
          <p className="text-sm text-white mb-6 max-w-sm">
            Keep your profile info fresh. Click below to update your name,
            photo, or other personal info.
          </p>
          <Link to="/profile">
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
              Profile
            </Button>
          </Link>
        </motion.div>

        {/* Find Nearby Dustbins */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-purple-400 hover:shadow-purple-100 h-80 flex flex-col justify-center items-center text-center"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Locate Nearby Dustbins
          </h3>
          <p className="text-sm text-white mb-6 max-w-sm">
            Want to dispose waste responsibly? Click below to find the nearest
            dustbins using our map.
          </p>
          <Link to="/map">
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
              Find Dustbins
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Contact Us Button */}
      <div className="mt-8 flex justify-center">
        <Link to="/contact-us">
          <Button
            variant="outlined"
            sx={{
              borderRadius: "999px",
              px: 4,
              py: 1,
              textTransform: "none",
              borderColor: "#9C27B0",
              color: "#9C27B0",
              "&:hover": {
                borderColor: "#7B1FA2",
                color: "#7B1FA2",
              },
            }}
          >
            Contact Us
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderDriverSections = () => (
    <div className="min-h-screen flex flex-col items-center py-12 px-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 flex flex-col items-center border border-purple-400 hover:shadow-purple-100 w-full max-w-lg"
      >
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-400 shadow-[0_0_25px_rgba(156,39,176,0.6)]">
            <img
              src={user?.profilePicture || defaultProfile}
              alt="Profile"
              className="w-full h-full object-cover object-center scale-150"
            />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
        <p className="text-sm font-semibold bg-purple-700/30 text-white px-4 py-1 rounded-full mt-2 shadow-sm">
          Driver
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-5xl">
        {/* Nearby Dustbins */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-purple-400 hover:shadow-purple-200 text-center min-h-[300px] flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-xl text-white mb-4">
              Nearby Dustbins
            </h3>
            <p className="text-sm text-white mb-4">
              This feature allows drivers to find the nearest smart dustbins to
              collect waste efficiently and improve area hygiene.
            </p>
          </div>
          <Link to="/driver">
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
              Find Garbage
            </Button>
          </Link>
        </motion.div>

        {/* Garbage Store Places */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-purple-400 hover:shadow-purple-200 h-80 flex flex-col justify-between"
        >
          <div className="space-y-6 text-base text-white">
            <h3 className="text-xl font-bold mb-2 text-center">
              Your Achievements
            </h3>
            <div className="flex justify-between">
              <span className="font-medium">Points Earned:</span>
              <span className="font-bold text-purple-300">{user.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Wallet Balance:</span>
              <span className="font-bold text-purple-300">
                ₹{user.walletBalance}
              </span>
            </div>
            <p className="text-sm mt-4 text-center">
              These reflect your contribution and rewards in the community.
            </p>
          </div>

          {/* All Transactions Button */}
          <div className="mt-4 text-center">
            <Link to="/transactions">
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
                All Transactions
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-8 w-full max-w-5xl">
        {/* Places Garbage Picked */}

        {/* Edit Profile Again */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-purple-400 hover:shadow-purple-200 text-center min-h-[300px] flex flex-col justify-center"
        >
          <div>
            <h3 className="text-xl text-white font-bold mb-4">
              Manage Your Info
            </h3>
            <p className="text-sm text-white mb-4">
              Update your personal details, profile photo, and other info from
              your profile page.
            </p>
            <Link to="/profile">
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
                Profile
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Contact Us Button */}
      <div className="mt-8 flex justify-center">
        <Link to="/contact-us">
          <Button
            variant="outlined"
            sx={{
              borderRadius: "999px",
              px: 4,
              py: 1,
              textTransform: "none",
              borderColor: "#9C27B0",
              color: "#9C27B0",
              "&:hover": {
                borderColor: "#7B1FA2",
                color: "#7B1FA2",
              },
            }}
          >
            Contact Us
          </Button>
        </Link>
      </div>
    </div>
  );

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <div
      className="min-h-screen px-6 py-6 text-white font-['Segoe UI']"
      style={{ background: "linear-gradient(135deg, #2D0035, #150050)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h1 className="text-5xl font-extrabold text-white drop-shadow-xl tracking-tight">
          Welcome to DesposeHub
        </h1>
        <p className="text-lg mt-4 max-w-2xl mx-auto text-gray-200 font-medium leading-relaxed">
          Empower your surroundings by responsibly disposing waste and earning
          rewards. Be the change the world needs.
        </p>
      </motion.div>

      {/* Conditional rendering based on user role */}
      {user.role === "user" ? renderUserSections() : renderDriverSections()}

      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/10 backdrop-blur-sm shadow-xl rounded-3xl p-8 mt-12 border border-purple-400 hover:shadow-purple-200 text-center"
      >
        <h2 className="text-2xl font-bold">Let's make the world cleaner!</h2>
      </motion.div> */}
    </div>
  );
}
