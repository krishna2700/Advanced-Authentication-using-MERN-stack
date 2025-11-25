import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String, // For password reset functionality
    resetPasswordExpires: Date, // For password reset functionality
    verificationToken: String, // For email verification functionality
    verificationTokenExpiresAt: Date, // For email verification functionality
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
