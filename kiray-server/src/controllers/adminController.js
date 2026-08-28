import { sendSuccess } from "../utils/apiResponse.js";
import * as adminDashboardService from "../services/adminDashboardService.js";
import * as adminUserService from "../services/adminUserService.js";

/**
 * GET /api/v1/admin/dashboard
 * High-level system overview metrics
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
 * Timeseries activity metrics (signups & listing creations)
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
 * GET /api/v1/admin/users
 * Paginated user search and filtering
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
 * Detailed user profile and activity overview
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
 * Suspend, reactivate, or ban user accounts
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
 * Promote or demote user roles
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
 * Force soft-delete a user profile and trigger listing deactivations
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
 * Restore a soft-deleted user account
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
