import express from "express";
import userRouter from "./routes/user.route.js";
import fs from "fs";
import fileRouter from "./routes/file.route.js";
import folderRouter from "./routes/folder.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:3000" }));

// Rate limiting for critical endpoints
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window per user
  keyGenerator: (req) => req.user || req.ip, // Use user ID if authenticated
  message: "Too many uploads. Please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 auth attempts per window per IP
  message: "Too many auth attempts. Please try again later.",
});

const shareLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 share link accesses per hour per IP
  message: "Too many share link accesses. Please try again later.",
});

app.use("/file/upload", uploadLimiter);
app.use("/user/login", authLimiter);
app.use("/user/register", authLimiter);
app.use("/file/share", shareLinkLimiter);

const dir = "./uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

app.use("/user", userRouter);
app.use("/file", fileRouter);
app.use("/folder", folderRouter);
app.use("/analytics", analyticsRouter);

export default app;
