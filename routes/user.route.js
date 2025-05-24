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
 *       $ref: '#/components/requestBodies/UserRegistration'
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
 *       $ref: '#/components/requestBodies/UserLogin'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 syncEnabled:
 *                   type: boolean
 *                   description: Whether Google Drive sync is enabled for the user
 *                 isConnected:
 *                   type: boolean
 *                   description: Whether the application is connected to Google Drive
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
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
 *       $ref: '#/components/requestBodies/DriveSyncUpdate'
 *     responses:
 *       200:
 *         description: Drive sync settings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Drive sync settings updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     syncEnabled:
 *                       type: boolean
 *                       description: The updated sync status
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
userRouter.patch("/setting/drive", authMiddleware, updateDriveSync);

export default userRouter;
