import express from "express";

import { protect } from "../middlewares/authMiddleware.js";

import {
  getNotifications,
  markNotificationsAsRead,
} from "../controllers/notificationControllers.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);

router.patch("/read", markNotificationsAsRead);

export default router;