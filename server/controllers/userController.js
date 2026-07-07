import User from "../models/userModel.js";
import cloudinary from "../utils/cloudinary.js";
import fs from 'fs';
import { getOne } from './handlerFactory.js';
import catchAsync from "../utils/catchAsync.js";


export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
  

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, vehicleNumber } = req.body;

    const user = await User.findOne({ _id : userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = name || user.name;
    user.vehicleNumber = vehicleNumber || user.vehicleNumber
    await user.save();

    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user", error: error.message });
  }
};


export const getAllUsers = async (req, res) => {    
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
  }
};


export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params; // Extract username from params

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(200).json({ success: false, message: "Username is taken" });
    }

    res.status(200).json({ success: true, message: "Username is available" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking username", error: error.message });
  }
};

export const uploadProfilePhoto = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "disposehub/profile-pictures",
  });

  fs.unlinkSync(req.file.path);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePicture: result.secure_url },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile photo uploaded successfully",
    data: {
      profilePicture: updatedUser.profilePicture,
    },
  });
});


export const getCurrentUser = getOne(User);