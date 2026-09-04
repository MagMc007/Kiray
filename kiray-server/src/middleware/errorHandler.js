import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error({ err }, err.message || "Unhandled error");

  // Multer upload errors -> client errors, not 500s
  if (err.name === "MulterError") {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({
      success: false,
      error: err.message,
    });
  }

  // Handle custom AppErrors and status code errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};

export default errorHandler;
