import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, setAuthLoading } from "./redux/slices/authSlice"; 

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
import { ToastContainer } from "react-toastify";
import { getAllGarbageDumps } from "./apis/garbageApi";
import { setNavigate } from "./utils/navigation";
import { Box, CircularProgress } from "@mui/material";
import { showErrorToast } from "./utils/showErrorToast";

function App() {
  const [garbageDumps, setGarbageDumps] = useState({ data: [] });
  const authLoading = useSelector((state) => state.auth.authLoading);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
      setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getMe();

        if (user) {
          dispatch(loginSuccess(user));
        }
      }
      catch (error) {
        showErrorToast(error);
      }  
      finally {
        dispatch(setAuthLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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

        <Route element={<ProtectedRoute allowedRoles={["user", "driver", "admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/editProfile" element={<EditUserProfile />} />
          </Route>
        </Route>

        {/* user + driver */}
        <Route element={<ProtectedRoute allowedRoles={["user", "driver"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/map" element={<Integrate />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/withdrawl-money" element={<Wallet />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
          <Route path="/driver" element={<DriverIntegrate />} />
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
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