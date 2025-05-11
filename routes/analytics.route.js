import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import analyticsMiddleware from "../middleware/analytics.middleware.js";
import {
  getAnalyticsSummary,
  getDetailedAnalytics,
} from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFiles:
 *                   type: number
 *                 totalFolders:
 *                   type: number
 *                 totalStorage:
 *                   type: number
 *                 mostAccessedFiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 */
analyticsRouter.get(
  "/summary",
  authMiddleware,
  analyticsMiddleware,
  getAnalyticsSummary
);

/**
 * @swagger
 * /analytics/detailed:
 *   get:
 *     summary: Get detailed analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Analytics'
 *       401:
 *         description: Unauthorized
 */
analyticsRouter.get(
  "/detailed",
  authMiddleware,
  analyticsMiddleware,
  getDetailedAnalytics
);

export default analyticsRouter;
