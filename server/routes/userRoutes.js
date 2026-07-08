import express from "express";
import * as userController from "../controllers/userController.js";
import {login, signup, logout, forgotPassword, resetPassword, updatePassword } from "../controllers/authController.js"
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);
router.get("/me", userController.getMe, userController.getCurrentUser);
// router.get("/", getAllUsers); // Route to get all users
// router.get("/check-username/:username", checkUsernameAvailability); // Route to check username availability
router.put(
  "/upload-profile-photo",
  upload.single("profileImage"),
  userController.uploadProfilePhoto
);
router.put("/update-profile", userController.updateUser);
router.put('/update-password', updatePassword);
export default router;