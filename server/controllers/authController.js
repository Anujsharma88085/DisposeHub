import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';


/* ================= TOKEN HELPERS ================= */

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
    expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

const sendJwtCookie = (user, res) => {
  const token = signToken(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);
};

const sendAuthResponse = (user, statusCode, res) => {
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};

/* ================= SIGNUP CONTROLLER ================= */

export const signup = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    role = "user",
    vehicleNumber,
  } = req.body;

  if (!name || !email || !password || !passwordConfirm) {
    return next(
      new AppError("Name, email and password are required", 400)
    );
  }

  if (role === "driver" && !vehicleNumber) {
    return next(
      new AppError("Vehicle number is required for drivers", 400, "vehicleNumber")
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new AppError("Email is already registered", 400, "email")
    );
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
    vehicleNumber: role === "driver" ? vehicleNumber : undefined,
  });

  sendJwtCookie(newUser, res);

  sendAuthResponse(newUser, 201, res);

  const logoUrl = `${process.env.BACKEND_URL}/logo/logo.png`;
  const dashboardURL = `${process.env.CLIENT_URL}`; 
  
  void (async () => {
    try {
      await new Email(newUser, dashboardURL, { logoUrl }).sendWelcome();
      if (process.env.NODE_ENV !== "production") {
        console.log("Welcome email sent");
      }
    } catch (err) {
      console.error("Welcome email failed:", err.message);
    }
  })();
});

export const googleCallback = (req, res) => {
  sendJwtCookie(req.user, res);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback`);
};


export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  sendJwtCookie(user, res);
  sendAuthResponse(user, 200, res);
});

export const logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.status(200).json({
    status: 'success',
  });
};


/* ===== Only for rendered pages (no errors) ===== */

export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      if (currentUser.ChangedPasswordAfter(decoded.iat)) return next();

      res.locals.user = currentUser;
    } catch (err) {
      return next();
    }
  }
  next();
};


/* ================= PASSWORD RESET ================= */

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('There is no user with that email address.', 404)
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'If an account exists with this email, you will receive a password reset link shortly.',
  });


  const logoUrl = `${process.env.BACKEND_URL}/logo/logo.png`;
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  new Email(user, resetURL, { logoUrl })
    .sendPasswordReset()
});

export const resetPassword = catchAsync(async (req, res, next) => {
  if (req.body.password.length < 5) {
    return next(
      new AppError("Password must be at least 5 characters long", 400)
    );
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError('Link is invalid or has expired', 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  
  sendJwtCookie(user, res);
  sendAuthResponse(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (
    !(await user.correctPassword(
      req.body.passwordCurrent,
      user.password
    ))
  ) {
    return next(
      new AppError('Current password is incorrect.', 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  sendJwtCookie(user, res);
  sendAuthResponse(user, 200, res);
});
