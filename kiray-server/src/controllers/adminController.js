import { sendSuccess } from "../utils/apiResponse.js";
import * as adminDashboardService from "../services/adminDashboardService.js";
import * as adminUserService from "../services/adminUserService.js";
import * as adminListingService from "../services/adminListingService.js";
import * as adminModerationService from "../services/adminModerationService.js";

/**
 * Module 1: Admin Dashboard & Analytics
 */

/**
 * GET /api/v1/admin/dashboard
 */
export const getDashboardOverview = async (req, res, next) => {
  try {
    const data = await adminDashboardService.getDashboardOverview();
    return sendSuccess(res, 200, "Dashboard overview retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/analytics/activity
 */
export const getActivityAnalytics = async (req, res, next) => {
  try {
    const data = await adminDashboardService.getActivityAnalytics(req.query);
    return sendSuccess(res, 200, "Activity analytics retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * Module 2: User Moderation & Management
 */

/**
 * GET /api/v1/admin/users
 */
export const listUsers = async (req, res, next) => {
  try {
    const data = await adminUserService.listUsers(req.query);
    return sendSuccess(res, 200, "Users retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/users/:id
 */
export const getUserDetail = async (req, res, next) => {
  try {
    const data = await adminUserService.getUserDetail(req.params.id);
    return sendSuccess(res, 200, "User details retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminUserService.updateUserStatus(
      req.user,
      req.params.id,
      req.body.status,
      req.body.reason,
      req.ip
    );
    return sendSuccess(res, 200, `User account status updated to ${user.status}`, user);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await adminUserService.updateUserRole(
      req.user,
      req.params.id,
      req.body.role,
      req.ip
    );
    return sendSuccess(res, 200, `User role updated to ${user.role}`, user);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await adminUserService.softDeleteUser(
      req.user,
      req.params.id,
      req.ip
    );
    return sendSuccess(res, 200, "User profile soft-deleted successfully", user);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/restore
 */
export const restoreUser = async (req, res, next) => {
  try {
    const user = await adminUserService.restoreUser(
      req.user,
      req.params.id,
      req.ip
    );
    return sendSuccess(res, 200, "User profile restored successfully", user);
  } catch (err) {
    next(err);
  }
};

/**
 * Module 3: Listing Moderation & Override
 */

/**
 * GET /api/v1/admin/listings
 */
export const listAdminListings = async (req, res, next) => {
  try {
    const data = await adminListingService.listAdminListings(req.query);
    return sendSuccess(res, 200, "Admin listings retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/listings/:id
 */
export const getAdminListingDetail = async (req, res, next) => {
  try {
    const data = await adminListingService.getAdminListingDetail(req.params.id);
    return sendSuccess(res, 200, "Listing details retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/listings/:id
 */
export const updateListingOverride = async (req, res, next) => {
  try {
    const listing = await adminListingService.updateListingOverride(
      req.user,
      req.params.id,
      req.body,
      req.ip
    );
    return sendSuccess(res, 200, "Listing overridden successfully", listing);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/listings/:id/status
 */
export const updateListingStatus = async (req, res, next) => {
  try {
    const listing = await adminListingService.updateListingStatus(
      req.user,
      req.params.id,
      req.body.status,
      req.ip
    );
    return sendSuccess(res, 200, `Listing status updated to ${listing.status}`, listing);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/listings/:id/verify
 */
export const verifyListing = async (req, res, next) => {
  try {
    const isVerified = req.body.isVerified !== undefined ? req.body.isVerified : true;
    const listing = await adminListingService.toggleVerifyListing(
      req.user,
      req.params.id,
      isVerified,
      req.ip
    );
    return sendSuccess(
      res,
      200,
      `Listing verification set to ${listing.isVerified}`,
      listing
    );
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/listings/:id/feature
 */
export const featureListing = async (req, res, next) => {
  try {
    const isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : true;
    const listing = await adminListingService.toggleFeatureListing(
      req.user,
      req.params.id,
      isFeatured,
      req.ip
    );
    return sendSuccess(
      res,
      200,
      `Listing featured status set to ${listing.isFeatured}`,
      listing
    );
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/listings/:id/deactivate
 */
export const deactivateListing = async (req, res, next) => {
  try {
    const listing = await adminListingService.deactivateListing(
      req.user,
      req.params.id,
      req.body.reason,
      req.ip
    );
    return sendSuccess(res, 200, "Listing deactivated by admin", listing);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/listings/:id/restore
 */
export const restoreListing = async (req, res, next) => {
  try {
    const listing = await adminListingService.restoreListing(
      req.user,
      req.params.id,
      req.ip
    );
    return sendSuccess(res, 200, "Listing restored successfully", listing);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/listings/:id/hard-delete
 */
export const hardDeleteListing = async (req, res, next) => {
  try {
    const result = await adminListingService.hardDeleteListing(
      req.user,
      req.params.id,
      req.ip
    );
    return sendSuccess(res, 200, "Listing permanently deleted", result);
  } catch (err) {
    next(err);
  }
};

/**
 * Module 4: Flag & Moderation Management
 */

/**
 * GET /api/v1/admin/flagged
 */
export const getFlaggedListings = async (req, res, next) => {
  try {
    const data = await adminModerationService.getFlaggedListings(req.query);
    return sendSuccess(res, 200, "Flagged listings retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/listings/:id/flags
 */
export const getListingReports = async (req, res, next) => {
  try {
    const data = await adminModerationService.getListingReports(req.params.id);
    return sendSuccess(res, 200, "Listing reports retrieved successfully", data);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/listings/:id/resolve
 */
export const resolveListingFlags = async (req, res, next) => {
  try {
    const listing = await adminModerationService.resolveListingFlags(
      req.user,
      req.params.id,
      req.body.notes,
      req.body.action,
      req.ip
    );
    return sendSuccess(res, 200, "Listing flags resolved successfully", listing);
  } catch (err) {
    next(err);
  }
};
