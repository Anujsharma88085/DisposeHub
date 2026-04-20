import Contact from '../models/contactModel.js';
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const COOLDOWN_DAYS = 5;

export const sendContactMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return next(new AppError("Message is required", 400));
  }

  const now = new Date();
  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

  const existing = await Contact.findOne({ user: userId });

  if (existing) {
    console.log("comes here");
    const diff = now - existing.lastSentAt;

    if (diff < cooldownMs) {
      const remaining = cooldownMs - diff;
      return next(
        new AppError(
          `Please wait ${Math.ceil(remaining / (1000 * 60 * 60))} hours before sending another message`,
          429
        )
      );
    }

    existing.message = message;
    existing.lastSentAt = now;
    await existing.save();
  } else {
    await Contact.create({
      user: userId,
      message,
      lastSentAt: now,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Message sent successfully",
  });
});


export const getContactStatus = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const existing = await Contact.findOne({ user: userId });

  if (!existing) {
    return res.status(200).json({
      canSend: true,
      remainingMs: 0,
    });
  }

  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = now - existing.lastSentAt.getTime();

  if (diff >= cooldownMs) {
    return res.status(200).json({
      canSend: true,
      remainingMs: 0,
    });
  }

  res.status(200).json({
    canSend: false,
    remainingMs: cooldownMs - diff,
  });
});



export const getAllContacts = async (req, res) => {
  try {
    const messages = await Contact.find()
    .populate("user")
    .sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

export const deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Message not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
}
