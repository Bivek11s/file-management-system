import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { formatErrorResponse } from "../utils/response.utils.js";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json(
        formatErrorResponse(
          "Autorization error",
          "You are not authorized to access this resource"
        )
      );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(formatErrorResponse("Autorization error", "Invalid token"));
  }
};
