import Analytics from "../models/analytics.model.js";

const analyticsMiddleware = async (req, res, next) => {
  try {
    const userId = req.user;
    const endpoint = `${req.method} ${req.originalUrl}`;
    // Skip for unauthenticated routes (e.g., share links)
    if (!userId) {
      return next();
    }
    await Analytics.findOneAndUpdate(
      { user: userId, endpoint },
      { $inc: { hitCount: 1 }, $set: { lastHit: new Date() } },
      { upsert: true, new: true }
    );

    next();
  } catch (error) {
    console.error("Analytics error:", err);
    next(); // Don't block request
  }
};

export default analyticsMiddleware;
