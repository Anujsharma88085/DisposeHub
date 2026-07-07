import mongoose from "mongoose";
import crypto from 'crypto';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  googleId: String,

  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
    minlength: 5,
    select: false
  },

  passwordConfirm: {
    type: String,
    required: function () {
      return this.provider === "local" && this.isNew;;
    },
    validate: {
      validator: function (el) {
        if (this.provider !== "local") return true;
        return el === this.password;
      },
      message: "Passwords are not the same"
    }
  },

  profilePicture: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["admin", "user", "driver"],
    default: "user"
  },

  vehicleNumber: {
    type: String,
    required: function () {
      return this.role === "driver";
    }
  },

  points: {
    type: Number,
    default: 0
  },

  walletBalance: {
    type: Number,
    default: 0
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
}, {
  timestamps: true
});

/* ================= PASSWORD ENCRYPT ================= */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

/* ================= PASSWORD CHECK ================= */

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/* ================= PASSWORD CHANGE CHECK ================= */

userSchema.methods.ChangedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
