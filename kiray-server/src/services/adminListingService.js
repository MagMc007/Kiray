import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import { NotFoundError, ValidationError } from "../utils/errors/index.js";
import { buildPagination } from "../utils/pagination.js";
import { logAuditAction } from "../utils/auditLogger.js";
import { removeListingImage } from "./listingImageService.js";

/**
 * List all listings with admin-level filters (including deleted, deactivated, or flagged)
 */
export const listAdminListings = async ({
  page = 1,
  limit = 20,
  q,
  status,
  propertyType,
  isFlagged,
  isVerified,
  isFeatured,
  isDeleted,
  sort = "newest",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (isDeleted !== undefined) {
    query.isDeleted = isDeleted === "true" || isDeleted === true;
  }

  if (isFlagged !== undefined) {
    query.isFlagged = isFlagged === "true" || isFlagged === true;
  }

  if (isVerified !== undefined) {
    query.isVerified = isVerified === "true" || isVerified === true;
  }

  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === "true" || isFeatured === true;
  }

  if (status) {
    query.status = status;
  }

  if (propertyType) {
    query.propertyType = propertyType;
  }

  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { "address.city": searchRegex },
      { "address.neighborhood": searchRegex },
    ];
  }

  const sortOption = {};
  switch (sort) {
    case "oldest":
      sortOption.createdAt = 1;
      break;
    case "price_asc":
      sortOption.price = 1;
      break;
    case "price_desc":
      sortOption.price = -1;
      break;
    case "newest":
    default:
      sortOption.createdAt = -1;
      break;
  }

  const [listings, totalItems] = await Promise.all([
    Listing.find(query)
      .populate("ownerId", "displayName email photoURL role status")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Listing.countDocuments(query),
  ]);

  return {
    listings,
    meta: buildPagination(pageNum, limitNum, totalItems),
  };
};

/**
 * Get single listing moderation overview including report history
 */
export const getAdminListingDetail = async (idOrSlug) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query)
    .populate("ownerId", "displayName email phone photoURL role status createdAt")
    .lean();

  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  const reports = await Report.find({ listingId: listing._id })
    .populate("reporterId", "displayName email")
    .sort({ createdAt: -1 })
    .lean();

  return {
    listing,
    reports,
  };
};

/**
 * Direct administrative override of listing details
 */
export const updateListingOverride = async (
  adminUser,
  idOrSlug,
  updateData,
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  Object.assign(listing, updateData);
  await listing.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: "LISTING_ADMIN_OVERRIDE",
    targetType: "Listing",
    targetId: listing._id,
    metadata: { updateData },
    ipAddress,
  });

  return listing;
};

/**
 * Force update listing status
 */
export const updateListingStatus = async (
  adminUser,
  idOrSlug,
  status,
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  const previousStatus = listing.status;
  listing.status = status;
  await listing.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: `LISTING_STATUS_${status.toUpperCase()}`,
    targetType: "Listing",
    targetId: listing._id,
    metadata: { previousStatus, newStatus: status },
    ipAddress,
  });

  return listing;
};

/**
 * Toggle listing verification status
 */
export const toggleVerifyListing = async (
  adminUser,
  idOrSlug,
  isVerified,
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  listing.isVerified = isVerified;
  await listing.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: isVerified ? "LISTING_VERIFY" : "LISTING_UNVERIFY",
    targetType: "Listing",
    targetId: listing._id,
    ipAddress,
  });

  return listing;
};

/**
 * Toggle listing featured/pinned status
 */
export const toggleFeatureListing = async (
  adminUser,
  idOrSlug,
  isFeatured,
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  listing.isFeatured = isFeatured;
  await listing.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: isFeatured ? "LISTING_FEATURE" : "LISTING_UNFEATURE",
    targetType: "Listing",
    targetId: listing._id,
    ipAddress,
  });

  return listing;
};

/**
 * Administrative take-down/deactivation of a listing
 */
export const deactivateListing = async (
  adminUser,
  idOrSlug,
  reason = "Administrative takedown",
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  listing.deactivatedByAdmin = true;
  listing.status = "unavailable";
  await listing.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: "LISTING_DEACTIVATE",
    targetType: "Listing",
    targetId: listing._id,
    metadata: { reason },
    ipAddress,
  });

  return listing;
};

/**
 * Restore soft-deleted or admin-deactivated listing
 */
export const restoreListing = async (
  adminUser,
  idOrSlug,
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  listing.isDeleted = false;
  listing.deletedAt = null;
  listing.deactivatedByAdmin = false;
  listing.status = "open";
  await listing.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: "LISTING_RESTORE",
    targetType: "Listing",
    targetId: listing._id,
    ipAddress,
  });

  return listing;
};

/**
 * Hard delete listing permanently and purge Cloudinary images
 */
export const hardDeleteListing = async (
  adminUser,
  idOrSlug,
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  // Delete associated Cloudinary images if present
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    await Promise.allSettled(
      listing.images.map((img) =>
        img.publicId ? removeListingImage(img.publicId) : Promise.resolve()
      )
    );
  }

  const listingId = listing._id;
  await Listing.deleteOne({ _id: listingId });

  await logAuditAction({
    adminId: adminUser._id,
    action: "LISTING_HARD_DELETE",
    targetType: "Listing",
    targetId: listingId,
    ipAddress,
  });

  return { _id: listingId, deleted: true };
};
