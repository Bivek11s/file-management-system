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

folderRouter.post("/create", authMiddleware, analyticsMiddleware, createFolder);
folderRouter.get("/list", authMiddleware, analyticsMiddleware, listFolders);
folderRouter.post(
  "/rename/:id",
  authMiddleware,
  analyticsMiddleware,
  renameFolder
);
folderRouter.delete(
  "/delete/:id",
  authMiddleware,
  analyticsMiddleware,
  deleteFolder
);
folderRouter.get(
  "/list/files/:id",
  authMiddleware,
  analyticsMiddleware,
  listFiles
);

export default folderRouter;
