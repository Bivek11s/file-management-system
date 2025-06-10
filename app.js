import express from "express";
import userRouter from "./routes/user.route.js";
import fs from "fs";
import fileRouter from "./routes/file.route.js";
import folderRouter from "./routes/folder.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import rateLimit from "express-rate-limit";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares for security and performance
app.use(helmet());
app.use(compression());

app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Swagger configuration (only for development)
if (process.env.NODE_ENV !== "production") {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "File Management System API",
        version: "1.0.0",
        description: "API documentation for the File Management System",
      },
      servers: [
        {
          url: process.env.API_URL || "http://localhost:5000",
          description: "Development server",
        },
      ],
    },
    apis: ["./routes/*.js"], // Path to the API routes
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

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

// Error handling middleware
import errorMiddleware from "./middleware/error.middleware.js";
app.use(errorMiddleware);

export default app;
