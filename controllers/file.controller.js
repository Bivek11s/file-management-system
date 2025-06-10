import File from "../models/file.model.js";
import { formatSuccessResponse } from "../utils/response.utils.js";
import crypto from "crypto";
import mongoose from "mongoose";
import Folder from "../models/folder.model.js";
import User from "../models/user.model.js";
import { uploadToDrive } from "../utils/googleDrive.util.js";
import sanitizeFileName from "sanitize-filename";
import asyncHandler from "../utils/asyncHandler.util.js";
import ErrorHandler from "../utils/errorHandler.util.js";
import fs from "fs";

//upload file
const uploadFile = asyncHandler(async (req, res, next) => {
  const { folderId } = req.body;
  const file = req.file;
  const userId = req.user;

  if (!file) {
    return next(new ErrorHandler("File not found", 400));
  }

  let folder = null;
  if (folderId) {
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return next(new ErrorHandler("Invalid folder id", 400));
    }
    folder = await Folder.findById(folderId);
    if (!folder || folder.owner.toString() !== userId) {
      return next(
        new ErrorHandler(
          "You do not have permission to upload file to this folder",
          403
        )
      );
    }
  }

  const newFile = new File({
    fileName: sanitizeFileName(file.originalname),
    path: file.path,
    size: file.size,
    mimeType: file.mimetype,
    folder: folderId || null,
    owner: userId,
    googleDrive: { syncStatus: "not_synced" },
  });

  const user = await User.findById(userId);
  if (user.googleDrive.syncEnabled) {
    try {
      newFile.googleDrive.syncStatus = "pending";
      await newFile.save();

      const { fileId, link } = await uploadToDrive(
        user,
        file.path,
        file.originalname,
        file.mimetype
      );

      newFile.googleDrive = {
        fileId,
        link,
        syncStatus: "synced",
      };
    } catch (err) {
      newFile.googleDrive.syncStatus = "failed";
      console.error("Google Drive sync error:", err);
    }
  }

  await newFile.save();

  const fileData = {
    id: newFile._id,
    fileName: newFile.fileName,
    size: newFile.size,
    uploadDate: newFile.uploadDate,
    mimeType: newFile.mimeType,
    folder: newFile.folder,
    accessLevel: newFile.accessLevel,
    googleDrive: newFile.googleDrive,
  };

  res
    .status(201)
    .json(formatSuccessResponse("File uploaded successfully", fileData));
});

//list all user's file
const listUserFiles = asyncHandler(async (req, res, next) => {
  const userId = req.user;
  const files = await File.find({
    $or: [{ owner: userId }, { sharedWith: userId }],
  })
    .populate("folder", "name")
    .select(
      "fileName size uploadDate mimeType folder owner sharedWith accessLevel shareToken shareTokenExpires"
    );
  res
    .status(200)
    .json(formatSuccessResponse("Files retrieved successfully", files));
});

//view / update access level
const updateFileAccessLevel = asyncHandler(async (req, res, next) => {
  const fileId = req.params.id;
  const { accessLevel, expiryHours } = req.body;
  const userId = req.user;

  const file = await File.findById(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  if (file.owner.toString() !== userId) {
    return next(
      new ErrorHandler("You do not have permission to update this file", 403)
    );
  }

  //validate access
  const validAccessLevels = ["only_me", "anyone_with_link", "timed_access"];
  if (!validAccessLevels.includes(accessLevel)) {
    return next(new ErrorHandler("Invalid access level", 400));
  }
  file.accessLevel = accessLevel;

  //generate share token for with timed access and anyone with link
  if (accessLevel === "anyone_with_link" || accessLevel === "timed_access") {
    file.shareToken = crypto.randomBytes(16).toString("hex");
    if (accessLevel === "timed_access") {
      if (!expiryHours || expiryHours <= 0) {
        return next(
          new ErrorHandler("Expiry hours is required for timed access", 400)
        );
      }
      file.shareTokenExpires = new Date(
        Date.now() + expiryHours * 60 * 60 * 1000
      );
    } else {
      file.shareTokenExpires = null;
    }
  } else {
    file.shareToken = null;
    file.shareTokenExpires = null;
  }

  await file.save();

  res
    .status(200)
    .json(formatSuccessResponse("File access updated successfully", file));
});

//download file by file id
const downloadFileById = asyncHandler(async (req, res, next) => {
  const fileId = req.params.id;
  const userId = req.user;

  const file = await File.findById(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  //check access permission
  if (file.owner.toString() !== userId && !file.sharedWith.includes(userId)) {
    return next(
      new ErrorHandler("You do not have permission to download this file", 403)
    );
  }

  //verify file existence
  if (!fs.existsSync(file.path)) {
    return next(new ErrorHandler("File not found in the server", 404));
  }
  file.downloadCount += 1;
  await file.save();
  res.download(file.path, file.fileName);
});

//download file by file name
const downloadFileByName = asyncHandler(async (req, res, next) => {
  const fileName = req.params.name;
  const userId = req.user;

  const file = await File.findOne({
    fileName,
    $or: [{ owner: userId }, { sharedWith: userId }],
  });
  if (!file) {
    return next(
      new ErrorHandler(
        "File not found or you do not have permission to download this file",
        404
      )
    );
  }
  //verify file existence
  if (!fs.existsSync(file.path)) {
    return next(new ErrorHandler("File not found in the server", 404));
  }

  file.downloadCount += 1;
  await file.save();
  res.download(file.path, file.fileName);
});

//generate shareable link
const generateShareableLink = asyncHandler(async (req, res, next) => {
  const fileId = req.params.id;
  const userId = req.user;

  const file = await File.findById(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  if (file.owner.toString() !== userId) {
    return next(
      new ErrorHandler("Only owner can generate shareable link", 403)
    );
  }
  if (file.accessLevel === "only_me") {
    return next(
      new ErrorHandler(
        "File is set to only me access level. Update access level to generate shareable link",
        400
      )
    );
  }

  //sharable link format:  /file/access/:shareToken
  const shareLink = `${req.protocol}://${req.get("host")}/file/access/${
    file.shareToken
  }`;

  res.status(200).json(
    formatSuccessResponse("Shareable link generated successfully", {
      shareLink,
    })
  );
});

//access file via sharable link
const accessFileViaShareableLink = asyncHandler(async (req, res, next) => {
  const shareToken = req.params.shareToken;
  const file = await File.findOne({ shareToken });
  if (!file) {
    return next(
      new ErrorHandler("File not found or shareable link is invalid", 404)
    );
  }
  if (file.accessLevel === "only_me") {
    return next(
      new ErrorHandler(
        "File is set to only me access level. You do not have permission to access this file",
        403
      )
    );
  }

  if (
    file.accessLevel === "timed_access" &&
    file.shareTokenExpires < Date.now()
  ) {
    file.accessLevel = "only_me";
    file.shareToken = null;
    file.shareTokenExpires = null;
    await file.save();
    return next(new ErrorHandler("File access has expired", 403));
  }

  res.download(file.path, file.fileName);
});

// Sync file to Google Drive manually
const syncFileToGoogleDrive = asyncHandler(async (req, res, next) => {
  const fileId = req.params.id;
  const userId = req.user;

  // Find the file
  const file = await File.findById(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  // Check ownership
  if (file.owner.toString() !== userId) {
    return next(
      new ErrorHandler("You do not have permission to sync this file", 403)
    );
  }

  // Get user to check sync settings
  const user = await User.findById(userId);
  if (!user.googleDrive.syncEnabled) {
    return next(
      new ErrorHandler(
        "Google Drive sync is not enabled. Please enable it in settings.",
        400
      )
    );
  }

  // Check if file exists locally
  if (!fs.existsSync(file.path)) {
    return next(new ErrorHandler("File not found in the server", 404));
  }

  // Update sync status to pending
  file.googleDrive.syncStatus = "pending";
  await file.save();

  try {
    // Upload to Google Drive
    const { fileId: driveFileId, link } = await uploadToDrive(
      user,
      file.path,
      file.fileName,
      file.mimeType
    );

    // Update file with Google Drive info
    file.googleDrive.fileId = driveFileId;
    file.googleDrive.link = link;
    file.googleDrive.syncStatus = "synced";
    await file.save();

    res.status(200).json(
      formatSuccessResponse("File synced to Google Drive successfully", {
        googleDrive: file.googleDrive,
      })
    );
  } catch (error) {
    file.googleDrive.syncStatus = "failed";
    await file.save();
    return next(new ErrorHandler("Google Drive sync failed", 500));
  }
});

export {
  uploadFile,
  listUserFiles,
  downloadFileById,
  downloadFileByName,
  updateFileAccessLevel,
  generateShareableLink,
  accessFileViaShareableLink,
  syncFileToGoogleDrive,
};
