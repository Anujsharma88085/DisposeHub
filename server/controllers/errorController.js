import AppError from "../utils/appError.js";
import path from "path";
import fs from "fs";
import rootDir from "../utils/rootDir.js";

/* ===================== DB ERROR HANDLERS ===================== */

// Invalid MongoDB ID
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Duplicate field
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  let message;

  if (field === "email") {
    message = "Email is already registered.";
  } else if (field === "vehicleNumber") {
    message = "Vehicle number is already registered.";
  } else {
    message = `${field} '${value}' already exists.`;
  }

  return new AppError(message, 400, field);
};

// Validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const errorTemplate = fs.readFileSync(
    path.join(rootDir, "views/error/error.html"),
    "utf-8"
);

const renderErrorPage = (message) => {
  return errorTemplate.replace(
    "{{ERROR_MESSAGE}}",
    message || "Something went wrong"
  );
};

/* ===================== DEV ERROR ===================== */

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered website
  res.status(err.statusCode || 500).send(renderErrorPage(err.message || "Unknown error"));
};

/* ===================== PROD ERROR ===================== */

const sendErrorProd = (err, req, res) => {
  if (!err.isOperational) {
    console.log("ERROR 💥", err);
  }

  // API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        field: err.field,
        message: err.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }

  // Rendered website
  const statusCode = err.isOperational ? err.statusCode : 500;
  const message = err.isOperational
    ? err.message
    : "Please try again later.";

  return res.status(statusCode).send(renderErrorPage(message));
};

/* ===================== FIREBASE ERROR ===================== */

const handleFirebaseError = (err) => {
  if (err.code === "auth/invalid-id-token")
    return new AppError("Invalid Firebase token", 401);

  if (err.code === "auth/id-token-expired")
    return new AppError("Firebase token expired, login again", 401);

  return new AppError(err.message || "Firebase error", 500);
};

/* ===================== GLOBAL ERROR HANDLER ===================== */

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.code?.startsWith("auth/")) err = handleFirebaseError(err);

    sendErrorProd(err, req, res);
  }
};
