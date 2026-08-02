import { UnauthorizedError } from "../utils/errors/index.js";

const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        throw new UnauthorizedError("Forbidden: admin role required");
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default requireRole;
