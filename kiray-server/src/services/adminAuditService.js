import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import { NotFoundError } from "../utils/errors/index.js";
import { buildPagination } from "../utils/pagination.js";

/**
 * List paginated administrative audit log entries with filters
 */
export const listAuditLogs = async ({
  page = 1,
  limit = 20,
  adminId,
  targetType,
  action,
  startDate,
  endDate,
  sort = "newest",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (adminId) {
    query.adminId = adminId;
  }

  if (targetType) {
    query.targetType = targetType;
  }

  if (action) {
    query.action = action;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const sortOrder = sort === "oldest" ? 1 : -1;

  const [logs, totalItems] = await Promise.all([
    AuditLog.find(query)
      .populate("adminId", "displayName email role")
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    meta: buildPagination(pageNum, limitNum, totalItems),
  };
};

/**
 * Get detailed audit log entry
 */
export const getAuditLogDetail = async (id) => {
  const log = await AuditLog.findById(id)
    .populate("adminId", "displayName email role")
    .lean();

  if (!log) {
    throw new NotFoundError("Audit log entry not found");
  }

  return log;
};

/**
 * Export complete user personal data dump for compliance (GDPR/Privacy)
 */
export const exportUserData = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const [listings, reports, auditHistory] = await Promise.all([
    Listing.find({ ownerId: userId }).lean(),
    Report.find({ reporterId: userId }).lean(),
    AuditLog.find({ targetId: userId }).lean(),
  ]);

  return {
    exportDate: new Date(),
    user,
    listings,
    reportsSubmitted: reports,
    auditHistory,
  };
};
