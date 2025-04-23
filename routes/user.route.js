import express from "express";
import { validateRequest } from "../middleware/validate.middleware.js";
import { login, register } from "../controllers/user.controller.js";
import { registerSchema, loginSchema } from "../validations/user.validation.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", validateRequest(registerSchema), register);
userRouter.post("/login", validateRequest(loginSchema), login);
userRouter.get("/profile", authMiddleware, (req, res) => {
  res.send("user profile");
});

export default userRouter;
