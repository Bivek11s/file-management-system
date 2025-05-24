import express from "express";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
  login,
  register,
  getDriveSyncStatus,
  updateDriveSync,
} from "../controllers/user.controller.js";
import { registerSchema, loginSchema } from "../validations/user.validation.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { oauth2Client } from "../utils/googleDrive.util.js";

const userRouter = express.Router();

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
userRouter.post("/register", validateRequest(registerSchema), register);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
userRouter.post("/login", validateRequest(loginSchema), login);

/**
 * @swagger
 * /user/setting/drive:
 *   get:
 *     summary: Get Google Drive sync status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Drive sync status retrieved
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/setting/drive", authMiddleware, getDriveSyncStatus);

/**
 * @swagger
 * /user/setting/drive:
 *   patch:
 *     summary: Update Google Drive sync settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Drive sync settings updated
 *       401:
 *         description: Unauthorized
 */
userRouter.patch("/setting/drive", authMiddleware, updateDriveSync);

export default userRouter;
