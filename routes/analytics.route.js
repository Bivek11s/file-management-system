import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import analyticsMiddleware from "../middleware/analytics.middleware.js";
import {
  getAnalyticsSummary,
  getDetailedAnalytics,
} from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/summary",
  authMiddleware,
  analyticsMiddleware,
  getAnalyticsSummary
);
analyticsRouter.get(
  "/detailed",
  authMiddleware,
  analyticsMiddleware,
  getDetailedAnalytics
);

export default analyticsRouter;
