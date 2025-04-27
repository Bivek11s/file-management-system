import express from "express";
import {
  uploadFile,
  listUserFiles,
  downloadFileByName,
  downloadFileById,
  updateFileAccessLevel,
  generateShareableLink,
  accessFileViaShareableLink,
} from "../controllers/file.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import analyticsMiddleware from "../middleware/analytics.middleware.js";

const fileRouter = express.Router();

fileRouter.post(
  "/upload",
  authMiddleware,
  analyticsMiddleware,
  upload.single("file"),
  uploadFile
);
fileRouter.get("/list", authMiddleware, analyticsMiddleware, listUserFiles);
fileRouter.get(
  "/download/name/:name",
  authMiddleware,
  analyticsMiddleware,
  downloadFileByName
);
fileRouter.get(
  "/download/id/:id",
  authMiddleware,
  analyticsMiddleware,
  downloadFileById
);
fileRouter.patch(
  "/access/update/:id",
  authMiddleware,
  analyticsMiddleware,
  updateFileAccessLevel
);
fileRouter.get(
  "/share/:id",
  authMiddleware,
  analyticsMiddleware,
  generateShareableLink
);
fileRouter.get(
  "/access/:shareToken",
  analyticsMiddleware,
  accessFileViaShareableLink
);

export default fileRouter;
