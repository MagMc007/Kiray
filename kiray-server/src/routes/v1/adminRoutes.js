import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/listingAccess.js";
import validate from "../../middleware/validateMiddleware.js";
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
} from "../../utils/validators.js";
import {
  getDashboardOverview,
  getActivityAnalytics,
  listUsers,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  restoreUser,
} from "../../controllers/adminController.js";

const router = Router();

// Protect all admin routes with authentication and admin role check
router.use(verifyAuth, requireRole("admin"));

/**
 * Module 1: Admin Dashboard & Analytics
 */
router.get("/dashboard", getDashboardOverview);
router.get("/analytics/activity", getActivityAnalytics);

/**
 * Module 2: User Moderation & Management
 */
router.get("/users", listUsers);
router.get("/users/:id", getUserDetail);
router.patch("/users/:id/status", validate(updateUserStatusSchema), updateUserStatus);
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/restore", restoreUser);

export default router;
