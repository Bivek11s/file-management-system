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
 *                 description: File to upload
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
 *       - $ref: '#/components/parameters/FileName'
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *       - $ref: '#/components/parameters/FileId'
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *       - $ref: '#/components/parameters/FileId'
 *     requestBody:
 *       $ref: '#/components/requestBodies/FileAccessUpdate'
 *     responses:
 *       200:
 *         description: Access level updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *       - $ref: '#/components/parameters/FileId'
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
 *                   description: Token for file sharing
 *                   example: "abc123def456ghi789"
 *                 shareTokenExpires:
 *                   type: string
 *                   format: date-time
 *                   description: Share token expiry date
 *                   example: "2023-12-31T23:59:59Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *       - $ref: '#/components/parameters/ShareToken'
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *       - $ref: '#/components/parameters/FileId'
 *     responses:
 *       200:
 *         description: File synced successfully
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
 *                   example: File synced to Google Drive successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     googleDrive:
 *                       type: object
 *                       properties:
 *                         fileId:
 *                           type: string
 *                           description: Google Drive file ID
 *                           example: "1Pt5xOvXnTFJ8lV9tK3lLcLa2XYZ"
 *                         link:
 *                           type: string
 *                           description: Google Drive file link
 *                           example: "https://drive.google.com/uc?id=1Pt5xOvXnTFJ8lV9tK3lLcLa2XYZ"
 *                         syncStatus:
 *                           type: string
 *                           enum: [pending, synced, failed, not_synced]
 *                           description: Google Drive sync status
 *                           example: "synced"
 *       400:
 *         description: Google Drive sync not enabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Google Drive sync not enabled"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
fileRouter.post("/sync/:id", authMiddleware, syncFileToGoogleDrive);

export default fileRouter;
