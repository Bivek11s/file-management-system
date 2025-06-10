import fs from "fs";
import { formatErrorResponse } from "../utils/response.utils.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the error for debugging
  console.error(
    `[${new Date().toISOString()}] ${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  console.error(err.stack);

  // If an error occurs during file upload, delete the temporary file
  if (req.file) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting uploaded file after error:", unlinkErr);
      }
    });
  }

  res.status(statusCode).json(formatErrorResponse(message));
};

export default errorMiddleware;
