import express from "express";
import {
  uploadFile,
  listUserFiles,
  downloadFileByName,
  downloadFileById,
  updateFileAccessLevel,
  generateShareableLink,
  accessFileViaShareableLink,
  syncFileToGoogleDrive,
} from "../controllers/file.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import analyticsMiddleware from "../middleware/analytics.middleware.js";

const fileRouter = express.Router();

/**
 * @swagger
 * /file/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 */
fileRouter.post(
  "/upload",
  authMiddleware,
  analyticsMiddleware,
  upload.single("file"),
  uploadFile
);

/**
 * @swagger
 * /file/list:
 *   get:
 *     summary: Get list of user's files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 */
fileRouter.get("/list", authMiddleware, analyticsMiddleware, listUserFiles);

/**
 * @swagger
 * /file/download/name/{name}:
 *   get:
 *     summary: Download file by name
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
fileRouter.get(
  "/download/name/:name",
  authMiddleware,
  analyticsMiddleware,
  downloadFileByName
);

/**
 * @swagger
 * /file/download/id/{id}:
 *   get:
 *     summary: Download file by ID
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
fileRouter.get(
  "/download/id/:id",
  authMiddleware,
  analyticsMiddleware,
  downloadFileById
);

/**
 * @swagger
 * /file/access/update/{id}:
 *   patch:
 *     summary: Update file access level
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessLevel
 *             properties:
 *               accessLevel:
 *                 type: string
 *                 enum: [only_me, anyone_with_link, timed_access]
 *     responses:
 *       200:
 *         description: Access level updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
fileRouter.patch(
  "/access/update/:id",
  authMiddleware,
  analyticsMiddleware,
  updateFileAccessLevel
);

/**
 * @swagger
 * /file/share/{id}:
 *   get:
 *     summary: Generate shareable link for file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shareable link generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shareToken:
 *                   type: string
 *                 shareTokenExpires:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
fileRouter.get(
  "/share/:id",
  authMiddleware,
  analyticsMiddleware,
  generateShareableLink
);

/**
 * @swagger
 * /file/access/{shareToken}:
 *   get:
 *     summary: Access file via shareable link
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found or invalid token
 */
fileRouter.get(
  "/access/:shareToken",
  analyticsMiddleware,
  accessFileViaShareableLink
);

/**
 * @swagger
 * /file/sync/{id}:
 *   post:
 *     summary: Manually sync file to Google Drive
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File synced successfully
 *       400:
 *         description: Google Drive sync not enabled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
fileRouter.post("/sync/:id", authMiddleware, syncFileToGoogleDrive);

export default fileRouter;
