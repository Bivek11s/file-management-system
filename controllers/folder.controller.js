import Folder from "../models/folder.model.js";
import File from "../models/file.model.js";
import {
  formatErrorResponse,
  formatSuccessResponse,
} from "../utils/response.utils.js";

//creating a folder
const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user;
    if (!name) {
      return res
        .status(400)
        .json(formatErrorResponse("Folder creation error", "Name is required"));
    }

    //check existing folder
    const existingFolder = await Folder.findOne({ name, owner: userId });
    if (existingFolder) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Folder creation error", "Folder already exists")
        );
    }
    const folder = new Folder({ name, owner: userId });
    await folder.save();
    return res
      .status(201)
      .json(formatSuccessResponse("Folder created successfully", folder));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(formatErrorResponse("Folder creation error", error.message));
  }
};

// List all user's folders
const listFolders = async (req, res) => {
  try {
    const userId = req.user;
    const folders = await Folder.find({ owner: userId }).select(
      "name createdAt"
    );
    if (!folders) {
      return res
        .status(404)
        .json(formatErrorResponse("Folder list error", "No folders found"));
    }

    res.status(200).json(formatSuccessResponse("Folders listed", folders));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//rename folder
const renameFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const folderId = req.params.id;
    const userId = req.user;
    if (!name) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Folder rename error",
            "Folder ID and new name are required"
          )
        );
    }
    const folder = await Folder.findOne({ _id: folderId, owner: userId });
    if (!folder) {
      return res
        .status(404)
        .json(formatErrorResponse("Folder rename error", "Folder not found"));
    }
    folder.name = name;
    await folder.save();
    res.status(200).json(formatSuccessResponse("Folder renamed", folder));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
    const userId = req.user;

    if (!folderId) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Folder delete error", "Folder ID is required")
        );
    }

    const folder = await Folder.findOne({
      _id: folderId,
      owner: userId,
    });
    if (!folder) {
      return res
        .status(404)
        .json(formatErrorResponse("Folder delete error", "Folder not found"));
    }
    if (folder.owner.toString() !== userId) {
      res
        .status(401)
        .json(
          formatErrorResponse(
            "Folder delete error",
            "You are not autorized to delete this folder"
          )
        );
    }
    await Folder.deleteOne();

    res.status(200).json(formatSuccessResponse("Folder deleted", folder));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//listing files within a folder
const listFiles = async (req, res) => {
  try {
    const folderId = req.params.id;
    const userId = req.user;
    if (!folderId) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Folder list error", "Folder ID is required")
        );
    }
    const folder = await Folder.findOne({
      _id: folderId,
      owner: userId,
    });
    if (!folder) {
      return res
        .status(404)
        .json(formatErrorResponse("Folder list error", "Folder not found"));
    }

    const files = await File.find({ folder: folderId }).select(
      "id fileName uploadDate"
    );
    if (!files) {
      return res
        .status(404)
        .json(formatErrorResponse("Folder list error", "No files found"));
    }
    res.status(200).json(formatSuccessResponse("Files listed", files));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createFolder, listFolders, renameFolder, deleteFolder, listFiles };
