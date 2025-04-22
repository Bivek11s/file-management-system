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
      expiresIn: "1h",
    });

    res.status(200).json(
      formatSuccessResponse("register success", {
        token: token,
        user: { id: newUser._id, email: newUser.email },
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
      expiresIn: "1h",
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

export { register, login };
