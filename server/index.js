import express from 'express';
import cors from 'cors';
import path from "path";
import rootDir from './utils/rootDir.js';
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import userRoutes from './routes/userRoutes.js';

import locationRoutes from './routes/loactionRoute.js'; 
import garbageRoutes from './routes/garbageRoute.js';


import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

import passport from "passport";
import cookieParser from "cookie-parser";
import "./config/passport.js";
import authRoutes from "./routes/googleAuthRoutes.js";

const app = express();
import RewardDistributionRouter from './routes/adminRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js'
dotenv.config({ path: './.env' });
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(express.static(path.join(rootDir, 'public')));
// Routes
app.use('/api/v1/users', userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/garbage', garbageRoutes); 

app.use('/api/v1/rewards', RewardDistributionRouter);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/transactions', transactionRoutes);


// Global error handler
app.use(globalErrorHandler);

export default app;
