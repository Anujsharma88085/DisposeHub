import express from 'express';
import cors from 'cors';
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import rootDir from './utils/rootDir.js';
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import userRoutes from './routes/userRoutes.js';
import locationRoutes from './routes/loactionRoute.js'; 
import garbageRoutes from './routes/garbageRoute.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import RewardDistributionRouter from './routes/adminRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js'

import cloudinary from 'cloudinary';

import passport from "passport";
import cookieParser from "cookie-parser";
import "./config/passport.js";
import authRoutes from "./routes/googleAuthRoutes.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(compression());

app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(rootDir, 'public')));

// Routes
app.use('/api/v1/users', userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/garbage', garbageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);

app.use('/api/v1/rewards', RewardDistributionRouter);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});


// Global error handler
app.use(globalErrorHandler);

export default app;
