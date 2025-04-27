import Analytics from "../models/analytics.model.js";
import File from "../models/file.model.js";
import mongoose from "mongoose";
import {
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/response.utils.js";

const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user;
    // Total files uploaded and storage used
    const fileStats = await File.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalStorage: { $sum: "$size" },
          totalDownloads: { $sum: "$downloadCount" },
        },
      },
    ]);

    // API hit count
    const apiStats = await Analytics.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalApiHits: { $sum: "$hitCount" },
        },
      },
    ]);

    const summary = {
      totalFiles: fileStats[0]?.totalFiles || 0,
      totalStorage: fileStats[0]?.totalStorage || 0, // In bytes
      totalDownloads: fileStats[0]?.totalDownloads || 0,
      totalApiHits: apiStats[0]?.totalApiHits || 0,
    };

    return res
      .status(200)
      .json(formatSuccessResponse("Analytics summary", summary));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        formatErrorResponse("Failed to fetch analytics summary", error.message)
      );
  }
};

const getDetailedAnalytics = async (req, res) => {
  try {
    const userId = req.user;

    // File details
    const files = await File.find({ owner: userId }).select(
      "filename size downloadCount uploadDate"
    );
    if (!files)
      return res
        .status(404)
        .json(formatErrorResponse("Analytics error", "No files found"));

    // API hit details
    const apiHits = await Analytics.find({ user: userId }).select(
      "endpoint hitCount lastHit"
    );
    if (!apiHits)
      return res
        .status(404)
        .json(formatErrorResponse("Analytics error", "No API hits found"));

    const responseData = {
      files: files.map((file) => ({
        filename: file.filename,
        size: file.size,
        downloadCount: file.downloadCount,
        uploadDate: file.uploadDate,
      })),
      apiHits: apiHits.map((hit) => ({
        endpoint: hit.endpoint,
        hitCount: hit.hitCount,
        lastHit: hit.lastHit,
      })),
    };
    return res
      .status(200)
      .json(formatSuccessResponse("Analytics details", responseData));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        formatErrorResponse("Failed to fetch analytics details", error.message)
      );
  }
};

export { getAnalyticsSummary, getDetailedAnalytics };
