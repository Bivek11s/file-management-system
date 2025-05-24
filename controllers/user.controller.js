import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  formatErrorResponse,
  formatSuccessResponse,
} from "../utils/response.utils.js";
import { oauth2Client } from "../utils/googleDrive.util.js";

dotenv.config();

//register user
const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(formatErrorResponse("register failure", "User already exists"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });

    res.status(200).json(
      formatSuccessResponse("register success", {
        token: token,
        user: { userId: newUser._id, email: newUser.email },
      })
    );
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .json(formatErrorResponse("register failure", error.message));
  }
};

//login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json(formatErrorResponse("login failure", "Invalid credentials"));
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json(formatErrorResponse("login failure", "Invalid credentials"));
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });

    res.status(200).json(
      formatSuccessResponse("login success", {
        token: token,
        user: { id: user._id, email: user.email },
      })
    );
  } catch (error) {
    console.log("error", error);
    res.status(500).json(formatErrorResponse("login failure", error.message));
  }
};

//get drive sync status
const getDriveSyncStatus = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId).select("googleDrive.syncEnabled");
    res.json({
      syncEnabled: user.googleDrive.syncEnabled,
      // Always connected since we're using service account
      isConnected: true,
    });
  } catch (err) {
    console.log("error", err);
    res
      .status(500)
      .json(formatErrorResponse("get drive sync status failure", err.message));
  }
};

// Enable/disable Drive sync
const updateDriveSync = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user;

    if (typeof enabled !== "boolean") {
      return res
        .status(400)
        .json(
          formatErrorResponse("Invalid request", "enabled must be a boolean")
        );
    }

    const user = await User.findById(userId);
    user.googleDrive.syncEnabled = enabled;
    await user.save();

    res.json(
      formatSuccessResponse("Drive sync settings updated", {
        syncEnabled: enabled,
      })
    );
  } catch (err) {
    res.status(500).json(formatErrorResponse("Server error", err.message));
  }
};

export { register, login, getDriveSyncStatus, updateDriveSync };
