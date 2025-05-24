import File from "../models/file.model.js";
import {
  formatErrorResponse,
  formatSuccessResponse,
} from "../utils/response.utils.js";
import fs from "fs";
import crypto from "crypto";
import mongoose from "mongoose";
import Folder from "../models/folder.model.js";
import User from "../models/user.model.js";
import { uploadToDrive, getFileInfo } from "../utils/googleDrive.util.js";
import sanitizeFileName from "sanitize-filename";
//upload file
const uploadFile = async (req, res) => {
  try {
    const { folderId } = req.body;
    const file = req.file;
    const userId = req.user;

    if (!file) {
      return res
        .status(400)
        .json(formatErrorResponse("File upload error", "File not found"));
    }

    let folder = null;
    if (folderId) {
      if (!mongoose.Types.ObjectId.isValid(folderId)) {
        return res
          .status(400)
          .json(formatErrorResponse("File upload error", "Invalid folder id"));
      }
      folder = await Folder.findById(folderId);
      if (!folder || folder.owner.toString() !== userId) {
        return res
          .status(403)
          .json(
            formatErrorResponse(
              "File upload error",
              "You do not have permission to upload file to this folder"
            )
          );
      }
    }

    const newFile = new File({
      fileName: sanitizeFileName(file.originalname), // Store original name,
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
        // Update sync status to pending before upload
        newFile.googleDrive.syncStatus = "pending";
        await newFile.save();

        // Upload to Google Drive using service account
        const { fileId, link } = await uploadToDrive(
          user,
          file.path,
          file.originalname,
          file.mimetype
        );

        // Update file with Google Drive info
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
      .status(200)
      .json(formatSuccessResponse("File uploaded successfully", fileData));
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
    res
      .status(500)
      .json(formatErrorResponse("File upload error", error.message));
    console.error(error);
  }
};

//list all user's file
const listUserFiles = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json(formatErrorResponse("File list error", error));
    console.log(error);
  }
};

//view / update access level
const updateFileAccessLevel = async (req, res) => {
  try {
    const fileId = req.params.id;
    const { accessLevel, expiryHours } = req.body;
    const userId = req.user;

    const file = await File.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json(
          formatErrorResponse("File access update error", "File not found")
        );
    }

    if (file.owner.toString() !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "File access update error",
            "You do not have permission to update this file"
          )
        );
    }

    //validate access
    const validAccessLevels = ["only_me", "anyone_with_link", "timed_access"];
    if (!validAccessLevels.includes(accessLevel)) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "File access update error",
            "Invalid access level"
          )
        );
    }
    file.accessLevel = accessLevel;

    //generate share token for with timed access and anyone with link
    if (accessLevel === "anyone_with_link" || accessLevel === "timed_access") {
      file.shareToken = crypto.randomBytes(16).toString("hex");
      if (accessLevel === "timed_access") {
        if (!expiryHours || expiryHours <= 0) {
          return res
            .status(400)
            .json(
              formatErrorResponse(
                "File access update error",
                "Expiry hours is required for timed access"
              )
            );
        }
        file.shareTokenExpires = new Date(Date.now() + expiryHours * 60 * 60);
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

    //verify file existence in disk
    if (!fs.existsSync(file.path)) {
      return res
        .status(404)
        .json(
          formatErrorResponse(
            "File access update error",
            "File not found in the server"
          )
        );
    }

    res.download(file.path, file.fileName);
  } catch (error) {
    res
      .status(500)
      .json(formatErrorResponse("File access update error", error.message));
    console.log(error);
  }
};

//download file by file id
const downloadFileById = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user;

    const file = await File.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json(formatErrorResponse("File download error", "File not found"));
    }

    //check access permission
    if (file.owner.toString() !== userId && !file.sharedWith.includes(userId)) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "File download error",
            "You do not have permission to download this file"
          )
        );
    }

    //verify file existence
    if (!fs.existsSync(file.path)) {
      return res
        .status(404)
        .json(
          formatErrorResponse(
            "File download error",
            "File not found in the server"
          )
        );
    }
    file.downloadCount += 1;
    await file.save();
    res.download(file.path, file.fileName);
  } catch (error) {
    res.status(500).json(formatErrorResponse("File download error", error));
    console.log(error);
  }
};

//download file by file name
const downloadFileByName = async (req, res) => {
  try {
    const fileName = req.params.name;
    const userId = req.user;

    const file = await File.findOne({
      fileName,
      $or: [{ owner: userId }, { sharedWith: userId }],
    });
    if (!file) {
      return res
        .status(404)
        .json(
          formatErrorResponse(
            "File download error",
            "File not found or you do not have permission to download this file"
          )
        );
    }
    //verify file existence
    if (!fs.existsSync(file.path)) {
      return res
        .status(404)
        .json(
          formatErrorResponse(
            "File download error",
            "File not found in the server"
          )
        );
    }

    file.downloadCount += 1;
    await file.save();
    res.download(file.path, file.fileName);
  } catch (error) {
    res.status(500).json(formatErrorResponse("File download error", error));
    console.log(error);
  }
};

//generate shareable link
const generateShareableLink = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user;

    const file = await File.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json(
          formatErrorResponse("File link grenation error", "File not found")
        );
    }

    if (file.owner.toString() !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "File link generation error",
            "Only owner can generate shareable link"
          )
        );
    }
    if (file.accessLevel === "only_me") {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "File link generation error",
            "File is set to only me access level. Update access level to generate shareable link"
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
  } catch (error) {
    res
      .status(500)
      .json(formatErrorResponse("File link generation error", error.message));
    console.log(error);
  }
};

//access file via sharable link
const accessFileViaShareableLink = async (req, res) => {
  try {
    const shareToken = req.params.shareToken;
    const file = await File.findOne({ shareToken });
    if (!file) {
      return res
        .status(404)
        .json(
          formatErrorResponse(
            "File access error",
            "File not found or shareable link is invalid"
          )
        );
    }
    if (file.accessLevel === "only_me") {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "File access error",
            "File is set to only me access level. You do not have permission to access this file"
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
      return res
        .status(403)
        .json(
          formatErrorResponse("File access error", "File access has expired")
        );
    }

    res.download(file.path, file.fileName);
  } catch (error) {
    res.status(500).json(formatErrorResponse("File access error", error));
    console.log(error);
  }
};

// Sync file to Google Drive manually
const syncFileToGoogleDrive = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user;

    // Find the file
    const file = await File.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json(formatErrorResponse("File sync error", "File not found"));
    }

    // Check ownership
    if (file.owner.toString() !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "File sync error",
            "You do not have permission to sync this file"
          )
        );
    }

    // Get user to check sync settings
    const user = await User.findById(userId);
    if (!user.googleDrive.syncEnabled) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "File sync error",
            "Google Drive sync is not enabled. Please enable it in settings."
          )
        );
    }

    // Check if file exists locally
    if (!fs.existsSync(file.path)) {
      return res
        .status(404)
        .json(
          formatErrorResponse("File sync error", "File not found in the server")
        );
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
      throw error;
    }
  } catch (error) {
    res.status(500).json(formatErrorResponse("File sync error", error.message));
    console.error(error);
  }
};

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
