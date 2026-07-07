import Notification from "../models/notificationModel.js";
import catchAsync from "../utils/catchAsync.js";

export const getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({
    receiver: req.user._id,
  })
  .sort({ createdAt: -1 })
  .limit(10);

  const unreadCount = await Notification.countDocuments({
    receiver: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
  });
});

export const markNotificationsAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    {
      receiver: req.user._id,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
  });
});