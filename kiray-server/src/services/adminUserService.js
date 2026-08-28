import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import { NotFoundError, ValidationError } from "../utils/errors/index.js";
import { buildPagination } from "../utils/pagination.js";
import { logAuditAction } from "../utils/auditLogger.js";

/**
 * List all users with pagination, filters, and text search
 */
export const listUsers = async ({
  page = 1,
  limit = 20,
  q,
  role,
  status,
  isDeleted,
  sort = "newest",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (isDeleted !== undefined) {
    query.isDeleted = isDeleted === "true" || isDeleted === true;
  } else {
    query.isDeleted = false;
  }

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), "i");
    query.$or = [
      { displayName: searchRegex },
      { email: searchRegex },
      { fullName: searchRegex },
      { phone: searchRegex },
    ];
  }

  const sortOption = {};
  switch (sort) {
    case "oldest":
      sortOption.createdAt = 1;
      break;
    case "displayName_asc":
      sortOption.displayName = 1;
      break;
    case "displayName_desc":
      sortOption.displayName = -1;
      break;
    case "newest":
    default:
      sortOption.createdAt = -1;
      break;
  }

  const [users, totalItems] = await Promise.all([
    User.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
    User.countDocuments(query),
  ]);

  return {
    users,
    meta: buildPagination(pageNum, limitNum, totalItems),
  };
};

/**
 * Get detailed user profile overview including listing & report statistics
 */
export const getUserDetail = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const [totalListings, activeListings, deletedListings, reportsSubmitted] =
    await Promise.all([
      Listing.countDocuments({ ownerId: userId }),
      Listing.countDocuments({ ownerId: userId, status: "open", isDeleted: false }),
      Listing.countDocuments({ ownerId: userId, isDeleted: true }),
      Report.countDocuments({ reporterId: userId }),
    ]);

  return {
    user,
    stats: {
      totalListings,
      activeListings,
      deletedListings,
      reportsSubmitted,
    },
  };
};

/**
 * Update account status (active, suspended, banned)
 */
export const updateUserStatus = async (
  adminUser,
  userId,
  status,
  reason = null,
  ipAddress = null
) => {
  if (adminUser._id?.toString() === userId.toString()) {
    throw new ValidationError("Administrators cannot modify their own account status");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const previousStatus = user.status;
  user.status = status;
  await user.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: `USER_STATUS_${status.toUpperCase()}`,
    targetType: "User",
    targetId: user._id,
    metadata: { previousStatus, newStatus: status, reason },
    ipAddress,
  });

  return user;
};

/**
 * Promote or demote user role
 */
export const updateUserRole = async (
  adminUser,
  userId,
  role,
  ipAddress = null
) => {
  if (adminUser._id?.toString() === userId.toString()) {
    throw new ValidationError("Administrators cannot modify their own role");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: "USER_ROLE_CHANGE",
    targetType: "User",
    targetId: user._id,
    metadata: { previousRole, newRole: role },
    ipAddress,
  });

  return user;
};

/**
 * Force soft-delete a user profile and cascade deactivation to their listings
 */
export const softDeleteUser = async (adminUser, userId, ipAddress = null) => {
  if (adminUser._id?.toString() === userId.toString()) {
    throw new ValidationError("Administrators cannot delete their own account");
  }

  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw new NotFoundError("User not found or already deleted");
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  // Cascade soft-deletion/deactivation to all listings owned by this user
  await Listing.updateMany(
    { ownerId: userId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), deactivatedByAdmin: true }
  );

  await logAuditAction({
    adminId: adminUser._id,
    action: "USER_SOFT_DELETE",
    targetType: "User",
    targetId: user._id,
    ipAddress,
  });

  return user;
};

/**
 * Restore a soft-deleted user account
 */
export const restoreUser = async (adminUser, userId, ipAddress = null) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (!user.isDeleted) {
    throw new ValidationError("User is not soft-deleted");
  }

  user.isDeleted = false;
  user.deletedAt = null;
  await user.save();

  await logAuditAction({
    adminId: adminUser._id,
    action: "USER_RESTORE",
    targetType: "User",
    targetId: user._id,
    ipAddress,
  });

  return user;
};
