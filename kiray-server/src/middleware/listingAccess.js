import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/errors/index.js";

export const requireOwnerOrAdmin = (listing, user) => {
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }

  if (user.role === "admin") {
    return;
  }

  const ownerId =
    listing.ownerId?._id?.toString() || listing.ownerId?.toString();
  const userId = user._id?.toString();

  if (!ownerId || ownerId !== userId) {
    throw new ForbiddenError(
      "You do not have permission to access this listing",
    );
  }
};

export const requireAdmin = (user) => {
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }
  if (user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
};

// Allows only users whose role is in `roles` (admin always passes).
// Returns a middleware that hands off to the global error handler on failure.
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }
      if (req.user.role === "admin" || roles.includes(req.user.role)) {
        return next();
      }
      throw new ForbiddenError(
        `Only ${roles.join(" or ")} can perform this action`,
      );
    } catch (error) {
      next(error);
    }
  };

export const loadListing = async (req, res, next, idOrSlug) => {
  try {
    // By default exclude soft-deleted listings. If this request is
    // attempting to restore a listing (route contains '/restore'), allow
    // loading deleted documents so restore can operate.
    const includeDeleted =
      req.originalUrl && req.originalUrl.includes("/restore");
    const query = includeDeleted ? {} : { isDeleted: false };
    if (mongoose.isValidObjectId(idOrSlug)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug;
    }

    const listing = await Listing.findOne(query).populate("ownerId");
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    req.listing = listing;
    next();
  } catch (error) {
    next(error);
  }
};
