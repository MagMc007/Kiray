import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import logger from "./config/logger.js";
import "./config/firebase.js"; // Initialize Firebase (fail fast if config is invalid)
import "./config/cloudinary.js"; // Initialize Cloudinary (fail fast if config is invalid)
import apiV1Router from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

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

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kiray API",
      version: "1.0.0",
      description: "Authentication and user profile endpoints",
    },
    servers: [{ url: "/" }],
  },
  apis: ["./src/routes/**/*.js", "./src/controllers/**/*.js"],
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API v1 routes
app.use("/api/v1", apiV1Router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error middleware (must be last)
app.use((err, req, res, next) => {
  logger.error({ err }, err.message || "Unhandled error");

  // Multer upload errors -> client errors, not 500s
  if (err.name === "MulterError") {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ success: false, error: err.message });
  }

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
