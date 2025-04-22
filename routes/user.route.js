import express from "express";
import { validateRequest } from "../middleware/validate.middleware.js";
import { login, register } from "../controllers/user.controller.js";
import { registerSchema, loginSchema } from "../validations/user.validation.js";

const userRouter = express.Router();

userRouter.post("/register", validateRequest(registerSchema), register);
userRouter.post("/login", validateRequest(loginSchema), login);

export default userRouter;
