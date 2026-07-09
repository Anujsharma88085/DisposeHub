import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../redux/actions/authActions";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { FaBell } from "react-icons/fa";
import NotificationDropdown from "./Notification";
import { logoutUser } from '../apis/authApi';


const Navbar = () => {
  const navigate = useNavigate();
  const [isBellOpen, setIsBellOpen] = useState(false);

  const bellRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = useSelector(
    (state) => state.notification.unreadCount
  );
  const user = useSelector((state) => state.auth.user);

  const toggleNotificationBell = () => setIsBellOpen(!isBellOpen);

  const role = user?.role;

  const handleLogout = async () => {
    try {
      await logoutUser();

      dispatch(logout());

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-8 py-4 shadow-md flex justify-between items-center">
      <div className="text-2xl font-bold tracking-wide">
        <Link to="/">DisposeHub</Link>
      </div>
      <div className="space-x-4 flex">
        <Link
            to="/"
            className="inline-block  bg-zinc-500 text-white font-medium px-10 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-fuchsia-700 transition-all duration-300"
        >
            Home
        </Link>
        <Link
            to={role === 'admin' ? "/admin-dashboard" : "/dashboard"}
            className="inline-block bg-zinc-500 text-white font-medium px-5 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-fuchsia-700 transition-all duration-300"
        >
            Dashboard
        </Link>

        {role !== "admin" && (
          <Link
              to="/leaderboard"
              className="inline-block bg-zinc-500 text-white font-medium px-5 py-2 rounded-lg shadow-md hover:bg-zinc-600 transition-all duration-300"
          >
          🏆 Leaderboard
          </Link>
        )}
      </div>
        
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        {role !== 'admin' && (
          <div
            ref={bellRef}
            className="relative" 
          >
            <FaBell
              className="cursor-pointer text-2xl text-red-400 hover:text-red-600 transition duration-200 hover:scale-110"
              onClick={toggleNotificationBell}
            />

            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}

            {isBellOpen && <NotificationDropdown />}
          </div>
        )}

        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
              textTransform: "none",
              borderRadius: "999px",
              bgcolor: "#e53935",
              color: "#ffffff",
              fontWeight: "bold",
              "&:hover": {
              bgcolor: "#d32f2f",
              },
          }}
          >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;