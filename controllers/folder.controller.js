import Folder from "../models/folder.model.js";
import File from "../models/file.model.js";
import { formatSuccessResponse } from "../utils/response.utils.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import ErrorHandler from "../utils/errorHandler.util.js";

//creating a folder
const createFolder = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user;
  if (!name) {
    return next(new ErrorHandler("Name is required", 400));
  }

  //check existing folder
  const existingFolder = await Folder.findOne({ name, owner: userId });
  if (existingFolder) {
    return next(new ErrorHandler("Folder already exists", 400));
  }
  const folder = new Folder({ name, owner: userId });
  await folder.save();
  res
    .status(201)
    .json(formatSuccessResponse("Folder created successfully", folder));
});

// List all user's folders
const listFolders = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  const folders = await Folder.find({ owner: userId }).select("name createdAt");

  res.status(200).json(formatSuccessResponse("Folders listed", folders));
});

//rename folder
const renameFolder = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const folderId = req.params.id;
  const userId = req.user;
  if (!name) {
    return next(new ErrorHandler("New name is required", 400));
  }
  const folder = await Folder.findOneAndUpdate(
    { _id: folderId, owner: userId },
    { name },
    { new: true }
  );
  if (!folder) {
    return next(new ErrorHandler("Folder not found", 404));
  }
  res.status(200).json(formatSuccessResponse("Folder renamed", folder));
});

const deleteFolder = asyncHandler(async (req, res, next) => {
  const folderId = req.params.id;
  const userId = req.user;

  const folder = await Folder.findOneAndDelete({ _id: folderId, owner: userId });

  if (!folder) {
    return next(new ErrorHandler("Folder not found", 404));
  }

  // Optional: Delete files within the folder
  await File.deleteMany({ folder: folderId, owner: userId });

  res.status(200).json(formatSuccessResponse("Folder deleted successfully"));
});

//listing files within a folder
const listFiles = asyncHandler(async (req, res, next) => {
  const folderId = req.params.id;
  const userId = req.user;

  const folder = await Folder.findOne({
    _id: folderId,
    owner: userId,
  });
  if (!folder) {
    return next(new ErrorHandler("Folder not found", 404));
  }

  const files = await File.find({ folder: folderId }).select(
    "id fileName uploadDate"
  );

  res.status(200).json(formatSuccessResponse("Files listed", files));
});

export { createFolder, listFolders, renameFolder, deleteFolder, listFiles };
