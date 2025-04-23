import File from "../models/file.model.js";
import {
  formatErrorResponse,
  formatSuccessResponse,
} from "../utils/response.utils.js";
import fs from "fs";

//upload file
const uploadFile = async (req, res) => {
  try {
    const { folder } = req.body;
    const file = req.file;
    const userId = req.user;

    if (!file) {
      return res
        .status(400)
        .json(formatErrorResponse("File upload error", "file not found"));
    }

    const newFile = new File({
      fileName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      folder: folder || null,
      owner: userId,
    });

    await newFile.save();

    res.status(200).json(formatSuccessResponse("File uploaded successfully"));
  } catch (error) {
    res.status(500).json(formatErrorResponse("File upload error", error));
    console.log(error);
  }
};

//list all user's file
const listUserFiles = async (req, res) => {
  try {
    const userId = req.user;
    const files = await File.find({
      $or: [{ owner: userId }, { sharedWith: userId }],
    }).select("fileName size uploadDate mimeType owner sharedWith");
    res
      .status(200)
      .json(formatSuccessResponse("Files retrieved successfully", files));
  } catch (error) {
    res.status(500).json(formatErrorResponse("File list error", error));
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

    res.download(file.path, file.fileName);
  } catch (error) {
    res.status(500).json(formatErrorResponse("File download error", error));
    console.log(error);
  }
};

export { uploadFile, listUserFiles, downloadFileById, downloadFileByName };
