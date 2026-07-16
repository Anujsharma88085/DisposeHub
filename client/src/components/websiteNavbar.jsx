import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../redux/actions/authActions";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import NotificationDropdown from "./Notification";

import { logoutUser } from '../apis/authApi';


const Navbar = () => {
  const navigate = useNavigate();
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bellRef = useRef(null);

  const dispatch = useDispatch();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

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
      if (import.meta.env.DEV) {
        console.error("Logout failed:", error);
      }

      dispatch(logout());
      navigate("/login");
    }
  };

  return (
  <nav className="sticky top-0 z-[9999] bg-gray-900 text-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Top Navbar */}
      <div className="flex items-center justify-between md:grid md:grid-cols-3 md:items-center">

        {/* Logo */}
        <div className="justify-self-start">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide"
          >
            DisposeHub
          </Link>
        </div>
        

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center items-center gap-4">

          <Link
            to="/"
            className="bg-zinc-500 px-5 py-2 rounded-lg hover:bg-zinc-600 transition"
          >
            Home
          </Link>

          <Link
            to={role === "admin" ? "/admin-dashboard" : "/dashboard"}
            className="bg-zinc-500 px-5 py-2 rounded-lg hover:bg-zinc-600 transition"
          >
            Dashboard
          </Link>

          {role !== "admin" && (
            <Link
              to="/leaderboard"
              className="bg-zinc-500 px-5 py-2 rounded-lg hover:bg-zinc-600 transition flex items-center gap-2"
            >
              <span>🏆</span>
              <span>Leaderboard</span>
            </Link>
          )}
        </div>

        <div className="hidden md:flex justify-self-end items-center gap-6">

          {role !== "admin" && (
            <div
              ref={bellRef}
              className="relative"
            >
              <FaBell
                className="cursor-pointer text-2xl text-red-400 hover:text-red-600 transition hover:scale-110"
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
              color: "#fff",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#d32f2f",
              },
            }}
          >
            Logout
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-2xl"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-gray-700 pt-4">

          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="bg-zinc-500 px-4 py-3 rounded-lg text-center hover:bg-zinc-600"
          >
            Home
          </Link>

          <Link
            to={role === "admin" ? "/admin-dashboard" : "/dashboard"}
            onClick={() => setIsMobileMenuOpen(false)}
            className="bg-zinc-500 px-4 py-3 rounded-lg text-center hover:bg-zinc-600"
          >
            Dashboard
          </Link>

          {role !== "admin" && (
            <Link
              to="/leaderboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-zinc-500 px-4 py-3 rounded-lg text-center hover:bg-zinc-600"
            >
              🏆 Leaderboard
            </Link>
          )}

          {role !== "admin" && (
            <div ref={bellRef} className="relative">
              <button
                onClick={toggleNotificationBell}
                className="w-full bg-zinc-500 px-4 py-3 rounded-lg hover:bg-zinc-600 transition flex items-center justify-center gap-3"
              >
                <FaBell className="text-red-400 text-xl" />

                <span className="font-medium">Notifications</span>

                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isBellOpen && <NotificationDropdown />}
            </div>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              bgcolor: "#e53935",
              "&:hover": {
                bgcolor: "#d32f2f",
              },
            }}
          >
            Logout
          </Button>

        </div>
      )}
    </div>
  </nav>
);

};

export default Navbar;