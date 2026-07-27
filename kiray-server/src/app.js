import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import logger from "./config/logger.js";
import apiV1Router from "./routes/index.js";

const app = express();

// Request logging middleware (must be early)
app.use(pinoHttp({ logger }));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// API v1 routes
app.use("/api/v1", apiV1Router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error middleware (must be last)
app.use((err, req, res, next) => {
  logger.error({ err }, err.message || "Unhandled error");

  // Handle custom errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Default server error
  res.status(500).json({ success: false, error: "Internal server error" });
});

export default app;
