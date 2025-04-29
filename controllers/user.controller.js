import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  formatErrorResponse,
  formatSuccessResponse,
} from "../utils/response.utils.js";

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
    const user = await User.findById(userId).select(
      "googleDrive.syncEnabled googleDrive.accessToken"
    );
    res.json({
      syncEnabled: user.googleDrive.syncEnabled,
      isConnected: !!user.googleDrive.accessToken,
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
    const { syncEnabled } = req.body;
    const userId = req.user;

    if (typeof syncEnabled !== "boolean") {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Invalid request",
            "syncEnabled must be a boolean"
          )
        );
    }

    const user = await User.findById(userId);
    if (!user.googleDrive.accessToken && syncEnabled) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Drive sync is not enabled",
            "Please connect to Google Drive first"
          )
        );
    }

    user.googleDrive.syncEnabled = syncEnabled;
    await user.save();

    res.json({ message: "Drive sync settings updated", syncEnabled });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//google callback
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { tokens } = await oauth2Client.getToken(code);
    user.googleDrive.accessToken = tokens.access_token;
    user.googleDrive.refreshToken = tokens.refresh_token;
    user.googleDrive.tokenExpiry = new Date(Date.now() + tokens.expiry_date);
    user.googleDrive.syncEnabled = true;
    await user.save();
    res.send("google callback success");
    // res.redirect("http://localhost:3000");
  } catch (err) {
    console.log("error", err);
    res
      .status(500)
      .json(formatErrorResponse("google callback failure", err.message));
  }
};

export { register, login, googleCallback, getDriveSyncStatus, updateDriveSync };
