import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import { NotFoundError } from "../utils/errors/index.js";
import { buildPagination } from "../utils/pagination.js";
import { logAuditAction } from "../utils/auditLogger.js";

/**
 * Get paginated list of flagged listings with report count summaries
 */
export const getFlaggedListings = async ({ page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = { isFlagged: true, isDeleted: false };

  const [listings, totalItems] = await Promise.all([
    Listing.find(query)
      .populate("ownerId", "displayName email role status")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Listing.countDocuments(query),
  ]);

  // Attach pending report counts to each flagged listing
  const listingIds = listings.map((l) => l._id);
  const reportCounts = await Report.aggregate([
    { $match: { listingId: { $in: listingIds }, status: "pending" } },
    { $group: { _id: "$listingId", count: { $sum: 1 } } },
  ]);

  const reportCountMap = new Map(
    reportCounts.map((r) => [r._id.toString(), r.count])
  );

  const formattedListings = listings.map((listing) => ({
    ...listing,
    pendingReportCount: reportCountMap.get(listing._id.toString()) || 0,
  }));

  return {
    listings: formattedListings,
    meta: buildPagination(pageNum, limitNum, totalItems),
  };
};

/**
 * Get detailed history of all submitted user reports on a listing
 */
export const getListingReports = async (idOrSlug) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query).select("_id title slug isFlagged flagReason").lean();
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  const reports = await Report.find({ listingId: listing._id })
    .populate("reporterId", "displayName email role")
    .sort({ createdAt: -1 })
    .lean();

  return {
    listing,
    reports,
  };
};

/**
 * Resolve moderation flags on a listing
 */
export const resolveListingFlags = async (
  adminUser,
  idOrSlug,
  notes = null,
  action = "dismiss",
  ipAddress = null
) => {
  const query = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const listing = await Listing.findOne(query);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  listing.isFlagged = false;
  listing.flagReason = null;

  if (action === "deactivate") {
    listing.deactivatedByAdmin = true;
    listing.status = "unavailable";
  } else if (action === "restore") {
    listing.deactivatedByAdmin = false;
    listing.isDeleted = false;
    listing.deletedAt = null;
    listing.status = "open";
  }

  await listing.save();

  // Resolve pending reports in Report collection
  const reportStatus = action === "dismiss" ? "dismissed" : "actioned";
  await Report.updateMany(
    { listingId: listing._id, status: "pending" },
    { status: reportStatus, resolvedBy: adminUser._id, resolvedAt: new Date() }
  );

  await logAuditAction({
    adminId: adminUser._id,
    action: `FLAG_RESOLVE_${action.toUpperCase()}`,
    targetType: "Listing",
    targetId: listing._id,
    metadata: { notes, action, resolvedReportStatus: reportStatus },
    ipAddress,
  });

  return listing;
};
