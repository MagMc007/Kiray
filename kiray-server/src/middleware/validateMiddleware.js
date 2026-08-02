import { ValidationError } from "../utils/errors/index.js";

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => i.message);
    return next(new ValidationError("Validation failed", details));
  }
  req.body = result.data; // parsed & coerced values
  next();
};

export default validate;
