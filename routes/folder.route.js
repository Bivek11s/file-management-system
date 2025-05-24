import express from "express";
import {
  createFolder,
  deleteFolder,
  listFiles,
  listFolders,
  renameFolder,
} from "../controllers/folder.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import analyticsMiddleware from "../middleware/analytics.middleware.js";

const folderRouter = express.Router();

/**
 * @swagger
 * /folder/create:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/FolderCreate'
 *     responses:
 *       201:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       401:
 *         description: Unauthorized
 */
folderRouter.post("/create", authMiddleware, analyticsMiddleware, createFolder);

/**
 * @swagger
 * /folder/list:
 *   get:
 *     summary: Get list of user's folders
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Folder'
 *       401:
 *         description: Unauthorized
 */
folderRouter.get("/list", authMiddleware, analyticsMiddleware, listFolders);

/**
 * @swagger
 * /folder/rename/{id}:
 *   post:
 *     summary: Rename a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FolderId'
 *     requestBody:
 *       $ref: '#/components/requestBodies/FolderRename'
 *     responses:
 *       200:
 *         description: Folder renamed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Folder not found
 */
folderRouter.post(
  "/rename/:id",
  authMiddleware,
  analyticsMiddleware,
  renameFolder
);

/**
 * @swagger
 * /folder/delete/{id}:
 *   delete:
 *     summary: Delete a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FolderId'
 *     responses:
 *       200:
 *         description: Folder deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Folder not found
 */
folderRouter.delete(
  "/delete/:id",
  authMiddleware,
  analyticsMiddleware,
  deleteFolder
);

/**
 * @swagger
 * /folder/list/files/{id}:
 *   get:
 *     summary: List files in a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FolderId'
 *     responses:
 *       200:
 *         description: List of files in folder
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Folder not found
 */
folderRouter.get(
  "/list/files/:id",
  authMiddleware,
  analyticsMiddleware,
  listFiles
);

export default folderRouter;
