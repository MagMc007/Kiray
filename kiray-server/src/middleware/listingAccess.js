import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors/index.js";

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
    throw new UnauthorizedError(
      "You do not have permission to access this listing",
    );
  }
};

export const requireAdmin = (user) => {
  if (!user || user.role !== "admin") {
    throw new UnauthorizedError("Admin access required");
  }
};

export const loadListing = async (req, res, next, idOrSlug) => {
  try {
    const query = { isDeleted: false };
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
