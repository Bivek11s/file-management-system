import express from "express";
import {
  createFolder,
  deleteFolder,
  listFiles,
  listFolders,
  renameFolder,
} from "../controllers/folder.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const folderRouter = express.Router();

folderRouter.post("/create", authMiddleware, createFolder);
folderRouter.get("/list", authMiddleware, listFolders);
folderRouter.post("/rename/:id", authMiddleware, renameFolder);
folderRouter.delete("/delete/:id", authMiddleware, deleteFolder);
folderRouter.get("/list/files/:id", authMiddleware, listFiles);

export default folderRouter;
