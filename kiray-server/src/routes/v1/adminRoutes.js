import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/listingAccess.js";
import validate from "../../middleware/validateMiddleware.js";
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
  statusUpdateSchema,
  adminListingOverrideSchema,
  resolveFlagsSchema,
  updateSystemConfigSchema,
  purgeSoftDeletedSchema,
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
  listAdminListings,
  getAdminListingDetail,
  updateListingOverride,
  updateListingStatus,
  verifyListing,
  featureListing,
  deactivateListing,
  restoreListing,
  hardDeleteListing,
  getFlaggedListings,
  getListingReports,
  resolveListingFlags,
  listAuditLogs,
  getAuditLogDetail,
  exportUserData,
  getSystemHealth,
  getSystemConfig,
  updateSystemConfig,
  purgeSoftDeleted,
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

/**
 * Module 3: Listing Moderation & Override
 */
router.get("/listings", listAdminListings);
router.get("/listings/:id", getAdminListingDetail);
router.put("/listings/:id", validate(adminListingOverrideSchema), updateListingOverride);
router.patch("/listings/:id/status", validate(statusUpdateSchema), updateListingStatus);
router.post("/listings/:id/verify", verifyListing);
router.patch("/listings/:id/feature", featureListing);
router.patch("/listings/:id/deactivate", deactivateListing);
router.patch("/listings/:id/restore", restoreListing);
router.delete("/listings/:id/hard-delete", hardDeleteListing);

/**
 * Module 4: Flag & Moderation Management
 */
router.get("/flagged", getFlaggedListings);
router.get("/listings/:id/flags", getListingReports);
router.patch("/listings/:id/resolve", validate(resolveFlagsSchema), resolveListingFlags);

/**
 * Module 5: Audit Log & Security Compliance
 */
router.get("/audit-logs", listAuditLogs);
router.get("/audit-logs/:id", getAuditLogDetail);
router.get("/security/users/:id/export", exportUserData);

/**
 * Module 6: System Configuration & Admin Maintenance
 */
router.get("/system/health", getSystemHealth);
router.get("/system/config", getSystemConfig);
router.patch("/system/config", validate(updateSystemConfigSchema), updateSystemConfig);
router.post(
  "/system/maintenance/purge-soft-deleted",
  validate(purgeSoftDeletedSchema),
  purgeSoftDeleted
);

export default router;
