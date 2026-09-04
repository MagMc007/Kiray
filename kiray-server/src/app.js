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

import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Request logging middleware (must be early)
app.use(
  pinoHttp({
    logger,
    customLogLevel(req, res, err) {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customProps(req) {
      return {
        userId: req.user?._id || req.user?.id || null,
        ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      };
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          headers: {
            host: req.headers.host,
            "user-agent": req.headers["user-agent"],
            authorization: req.headers.authorization ? "[REDACTED]" : undefined,
          },
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
    customSuccessMessage(req, res, responseTime) {
      return `request completed in ${responseTime}ms`;
    },
    customErrorMessage(req, res, err) {
      return `request failed with status ${res.statusCode}: ${err.message}`;
    },
  })
);

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
      description: "Authentication, listings, user, and observability endpoints",
    },
    servers: [{ url: "/" }],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Server is running" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Error message details" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Validation failed" },
            details: {
              type: "array",
              items: { type: "string" },
              example: ["Field 'title' is required", "Field 'price' must be positive"],
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/**/*.js", "./src/controllers/**/*.js", "./src/app.js"],
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System health check endpoint
 *     description: Returns system operational status and health info.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               success: true
 *               message: "Server is running"
 */
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
app.use(errorHandler);

export default app;
