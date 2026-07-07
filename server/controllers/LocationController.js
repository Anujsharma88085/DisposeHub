import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Location from "../models/locationModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import Transaction from "../models/transactionModel.js";
import {
  emitPickupCreated,
  emitPickupUpdated,
  emitPickupCancelled,
  emitPickupCompleted,
  emitNotification,
} from "../socket/services/socketEmitter.js";


export const getMyActiveLocation = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const location = await Location.findOne({ markedBy: userId, active: true });
  
  res.status(200).json({
    success: true,
    location,
  });
});

export const saveLocation = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { lat, lng, locationName } = req.body;

  if (lat === undefined || lng === undefined) {
    return next(new AppError("Missing required fields", 400));
  }

  const existingLocation = await Location.findOne({
    markedBy: userId,
    active: true,
  });

  let location;

  if (existingLocation) {
    existingLocation.lat = lat;
    existingLocation.long = lng;
    existingLocation.locationName = locationName;

    location = await existingLocation.save();

    emitPickupUpdated(location);
  } else {
    location = await Location.create({
      markedBy: userId,
      lat,
      long: lng,
      locationName,
      active: true,
    });
    emitPickupCreated(location);
  }
  
  res.status(201).json({
    success: true,
    message: "Garbage location marked successfully",
    location,
  });
});

export const cancelLocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const location = await Location.findById(id);

  if (!location) {
    return next(new AppError("Location not found.", 404));
  }

  // Ensure the user owns this pickup
  if (location.markedBy.toString() !== userId.toString()) {
    return next(
      new AppError("You are not allowed to cancel this pickup.", 403)
    );
  }

  if (!location.active) {
    return next(
      new AppError("Pickup is already inactive.", 400)
    );
  }

  location.active = false;
  location.status = "CANCELLED";
  await location.save();

  emitPickupCancelled(location);

  res.status(200).json({
    success: true,
    message: "Pickup cancelled successfully.",
  });
});

export const getActiveLocations = catchAsync(async (req, res, next) => {
  const locations = await Location.find({ active: true });

  res.status(200).json({
    success: true,
    results: locations.length,
    locations,
  });
});

export const deactivateLocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const driverId = req.user._id;

  // 1. Find location
  const location = await Location.findById(id);

  if (!location) {
    return next(new AppError("Location not found", 404));
  }

  if (!location.active) {
    return next(new AppError("Location is already deactivated", 400));
  }

  // 2. Deactivate location
  location.active = false;
  location.pickedBy = driverId;
  location.status = "COMPLETED";
  await location.save();

  // ===== Rewards Config =====
  const USER_POINT_REWARD = Number(process.env.USER_POINT_REWARD) || 10;
  const USER_WALLET_REWARD = Number(process.env.USER_WALLET_REWARD) || 5;

  const DRIVER_POINT_REWARD = Number(process.env.DRIVER_POINT_REWARD) || 20;
  const DRIVER_WALLET_REWARD = Number(process.env.DRIVER_WALLET_REWARD) || 10;

  // 3. Reward DRIVER
  const driver = await User.findByIdAndUpdate(
    driverId,
    {
      $inc: {
        points: DRIVER_POINT_REWARD,
        walletBalance: DRIVER_WALLET_REWARD,
      },
    },
    { new: true }
  );

  if (!driver) {
    return next(new AppError("Driver not found", 404));
  }

  // 4. Reward USER who marked location
  const user = await User.findByIdAndUpdate(
    location.markedBy,
    {
      $inc: {
        points: USER_POINT_REWARD,
        walletBalance: USER_WALLET_REWARD,
      },
    },
    { new: true }
  );

  if (!user) {
    return next(new AppError("User who marked location not found", 404));
  }

  // 5. Notifications
  const [driverNotification, userNotification] = 
    await Notification.insertMany([
    {
      receiver: driverId,
      messagePreview: `You successfully collected garbage from ${location.locationName}. Reward: +${DRIVER_POINT_REWARD} points and +₹${DRIVER_WALLET_REWARD}.`,
      isRead: false,
    },
    {
      receiver: user._id,
      messagePreview: `Your garbage report at ${location.locationName} has been completed. You earned +${USER_POINT_REWARD} points and +₹${USER_WALLET_REWARD}. Thank you for helping keep the city clean!`,
      isRead: false,
    },
  ]);

  emitNotification(
    driverId.toString(),
    {
        notification: driverNotification,
        user: {
            points: driver.points,
            walletBalance: driver.walletBalance,
        }
    }
  );

  emitNotification(
    user._id.toString(),
    {
        notification: userNotification,
        user: {
            points: user.points,
            walletBalance: user.walletBalance,
        }
    }
  );

  // 6. Transactions
  await Transaction.create([
    {
      user: driverId,
      amount: DRIVER_WALLET_REWARD,
      type: "CREDIT",
      source: "REWARD",
      description: "Reward for garbage pickup",
    },
    {
      user: user._id,
      amount: USER_WALLET_REWARD,
      type: "CREDIT",
      source: "REWARD",
      description: "Reward for reporting garbage",
    },
  ]);

  emitPickupCompleted(location);

  res.status(200).json({
    success: true,
    message: "Location deactivated and rewards distributed successfully",
    location,
    rewards: {
      driver: {
        points: DRIVER_POINT_REWARD,
        wallet: DRIVER_WALLET_REWARD,
      },
      user: {
        points: USER_POINT_REWARD,
        wallet: USER_WALLET_REWARD,
      },
    },
  });
});


