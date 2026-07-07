import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/slices/authSlice"; 

// Pages and Components
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Login from "./pages/register/Login";
import Signup from "./pages/register/SignUp";
import Leaderboard from "./components/leaderboard";
import DriverIntegrate from "./pages/GeneralUser/driverIntegrate";
import Dashboard from "./pages/home/Dashboard";
import LandingPage from "./pages/Landing";
import ContactUsPage from "./pages/ContactUsPage";
import Integrate from "./pages/GeneralUser/Integrate";
import { Wallet } from "./components/Wallet";
import UserProfile from "./pages/profile/profile";
import EditUserProfile from "./pages/profile/editProfile";
import TransactionsPage from "./pages/TransactionPage";
import { getMe } from "./apis/userApi";
import AdminDashboard from "./pages/adminPages/adminDashboard";
import ContactMessages from "./pages/contactMessages";
import AdminTransactions from "./pages/AdminTransactions";
import AuthCallback from "./auth/AuthCallback";
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [garbageDumps, setGarbageDumps] = useState({ data: [] });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const dispatch = useDispatch();

  // AUTH + INITIAL FETCH
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getMe();
        
        if (user) {
          dispatch(loginSuccess(user));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }finally {
        setAuthLoading(false);
      }
    };

    const fetchGarbageDumps = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/garbage/all`);
        const data = await response.json();
        if (data.success) {
          setGarbageDumps(data);
        } else {
          console.error("Failed to fetch garbage dumps:", data.message);
        }
      } catch (error) {
        console.error("Error fetching garbage dumps:", error);
      }
    };

    fetchUser();
    fetchGarbageDumps();
  }, [dispatch]);

  if (authLoading) return <div>Loading...</div>;

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* user + driver */}
        <Route element={<ProtectedRoute allowedRoles={["user", "driver"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/map" element={<Integrate garbageDumps={garbageDumps} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editProfile" element={<EditUserProfile />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/withdrawl-money" element={<Wallet />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
          <Route path="/driver" element={<DriverIntegrate garbageDumps={garbageDumps} />} />
        </Route>

        {/*  ADMIN ONLY ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/contact-messages" element={<ContactMessages />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}