import Analytics from "../models/analytics.model.js";
import File from "../models/file.model.js";
import mongoose from "mongoose";
import { formatSuccessResponse } from "../utils/response.utils.js";
import asyncHandler from "../utils/asyncHandler.util.js";

const getAnalyticsSummary = asyncHandler(async (req, res, next) => {
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

  res.status(200).json(formatSuccessResponse("Analytics summary", summary));
});

const getDetailedAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.user;

  // File details
  const files = await File.find({ owner: userId }).select(
    "fileName size downloadCount uploadDate"
  );

  // API hit details
  const apiHits = await Analytics.find({ user: userId }).select(
    "endpoint hitCount lastHit"
  );

  const responseData = {
    files: files.map((file) => ({
      fileName: file.fileName,
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
  res.status(200).json(formatSuccessResponse("Analytics details", responseData));
});

export { getAnalyticsSummary, getDetailedAnalytics };
