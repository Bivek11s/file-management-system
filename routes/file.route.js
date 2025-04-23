import express from "express";
import {
  uploadFile,
  listUserFiles,
  downloadFileByName,
  downloadFileById,
} from "../controllers/file.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const fileRouter = express.Router();

fileRouter.post("/upload", authMiddleware, upload.single("file"), uploadFile);
fileRouter.get("/list", authMiddleware, listUserFiles);
fileRouter.get("/download/name/:name", authMiddleware, downloadFileByName);
fileRouter.get("/download/id/:id", authMiddleware, downloadFileById);

export default fileRouter;
