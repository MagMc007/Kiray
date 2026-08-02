import AppError from "./AppError.js";

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = []) {
    super(message, 400);
    this.details = details;
  }
}

export default ValidationError;
