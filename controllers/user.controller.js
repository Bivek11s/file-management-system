import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  formatSuccessResponse,
} from "../utils/response.utils.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import ErrorHandler from "../utils/errorHandler.util.js";

dotenv.config();

//register user
const register = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  // Generate JWT
  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "5h",
  });

  res.status(201).json(
    formatSuccessResponse("User registered successfully", {
      token,
      user: { userId: newUser._id, email: newUser.email },
    })
  );
});

//login user
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // Generate JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5h",
  });

  res.status(200).json(
    formatSuccessResponse("Login successful", {
      token,
      user: { id: user._id, email: user.email },
    })
  );
});

//get drive sync status
const getDriveSyncStatus = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  const user = await User.findById(userId).select("googleDrive.syncEnabled");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json(
    formatSuccessResponse("Drive sync status retrieved", {
      syncEnabled: user.googleDrive.syncEnabled,
      isConnected: true, // Always connected with a service account
    })
  );
});

// Enable/disable Drive sync
const updateDriveSync = asyncHandler(async (req, res, next) => {
  const { enabled } = req.body;
  const userId = req.user;

  if (typeof enabled !== "boolean") {
    return next(new ErrorHandler("Invalid request: 'enabled' must be a boolean", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.googleDrive.syncEnabled = enabled;
  await user.save();

  res.status(200).json(
    formatSuccessResponse("Drive sync settings updated", {
      syncEnabled: enabled,
    })
  );
});

export { register, login, getDriveSyncStatus, updateDriveSync };
