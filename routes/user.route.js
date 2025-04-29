import express from "express";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
  login,
  register,
  googleCallback,
  getDriveSyncStatus,
  updateDriveSync,
} from "../controllers/user.controller.js";
import { registerSchema, loginSchema } from "../validations/user.validation.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { oauth2Client } from "../utils/googleDrive.util.js";

const userRouter = express.Router();

userRouter.post("/register", validateRequest(registerSchema), register);
userRouter.post("/login", validateRequest(loginSchema), login);

userRouter.get("/google/callback", googleCallback);
userRouter.get("/setting/drive", authMiddleware, getDriveSyncStatus);
userRouter.patch("/setting/drive", authMiddleware, updateDriveSync);

// Google OAuth: Start authentication (redircts to the consent screen)
//removed authentication for testing purpose
userRouter.get("/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent",
  });
  res.redirect(authUrl);
});

export default userRouter;
