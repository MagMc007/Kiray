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
 * @openapi
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: High-level system overview metrics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics aggregated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/dashboard", getDashboardOverview);

/**
 * @openapi
 * /api/v1/admin/analytics/activity:
 *   get:
 *     summary: Timeseries activity metrics for users and listings
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Activity timeseries data returned
 */
router.get("/analytics/activity", getActivityAnalytics);

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     summary: Search, filter, and paginate user accounts
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [landlord, rentee, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended, banned]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated users list returned
 */
router.get("/users", listUsers);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get detailed user overview and activity breakdown
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed user profile and activity returned
 *       44:
 *         description: User not found
 */
router.get("/users/:id", getUserDetail);

/**
 * @openapi
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     summary: Suspend, reactivate, or ban user accounts
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, banned]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User account status updated
 */
router.patch("/users/:id/status", validate(updateUserStatusSchema), updateUserStatus);

/**
 * @openapi
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Promote or demote user roles
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [landlord, rentee, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 */
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Force soft-delete a user profile and cascade listing deactivations
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile soft-deleted
 */
router.delete("/users/:id", deleteUser);

/**
 * @openapi
 * /api/v1/admin/users/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted user account
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User account restored
 */
router.patch("/users/:id/restore", restoreUser);

/**
 * @openapi
 * /api/v1/admin/listings:
 *   get:
 *     summary: Search and filter all listings including hidden, deactivated, or soft-deleted
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, rented, unavailable]
 *       - in: query
 *         name: isFlagged
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of listings retrieved
 */
router.get("/listings", listAdminListings);

/**
 * @openapi
 * /api/v1/admin/listings/{id}:
 *   get:
 *     summary: Detailed moderation overview for a listing with report history
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing moderation detail returned
 */
router.get("/listings/:id", getAdminListingDetail);

/**
 * @openapi
 * /api/v1/admin/listings/{id}:
 *   put:
 *     summary: Direct administrative override for listing details
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing details updated by admin
 */
router.put("/listings/:id", validate(adminListingOverrideSchema), updateListingOverride);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/status:
 *   patch:
 *     summary: Force update listing availability status
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, rented, unavailable]
 *     responses:
 *       200:
 *         description: Listing availability status updated
 */
router.patch("/listings/:id/status", validate(statusUpdateSchema), updateListingStatus);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/verify:
 *   post:
 *     summary: Toggle verified property badge
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification flag updated
 */
router.post("/listings/:id/verify", verifyListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/feature:
 *   patch:
 *     summary: Toggle featured/pinned status on discovery feeds
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Featured flag updated
 */
router.patch("/listings/:id/feature", featureListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/deactivate:
 *   patch:
 *     summary: Administrative take-down/unpublish of a listing
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing deactivated by admin
 */
router.patch("/listings/:id/deactivate", deactivateListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted or taken-down listing
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing restored successfully
 */
router.patch("/listings/:id/restore", restoreListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/hard-delete:
 *   delete:
 *     summary: Permanently purge listing and delete Cloudinary assets
 *     tags: [Admin Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing permanently purged
 */
router.delete("/listings/:id/hard-delete", hardDeleteListing);

/**
 * @openapi
 * /api/v1/admin/flagged:
 *   get:
 *     summary: Paginated list of flagged listings with report count summaries
 *     tags: [Admin Moderation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flagged listings retrieved
 */
router.get("/flagged", getFlaggedListings);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/flags:
 *   get:
 *     summary: Detailed report history submitted against a listing
 *     tags: [Admin Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing reports returned
 */
router.get("/listings/:id/flags", getListingReports);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/resolve:
 *   patch:
 *     summary: Resolve moderation flags and update pending report states
 *     tags: [Admin Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [dismiss, deactivate, restore]
 *                 default: dismiss
 *     responses:
 *       200:
 *         description: Flags resolved successfully
 */
router.patch("/listings/:id/resolve", validate(resolveFlagsSchema), resolveListingFlags);

/**
 * @openapi
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Paginated administrative audit logs
 *     tags: [Admin Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Audit logs retrieved
 */
router.get("/audit-logs", listAuditLogs);

/**
 * @openapi
 * /api/v1/admin/audit-logs/{id}:
 *   get:
 *     summary: Detail view of a single audit log entry
 *     tags: [Admin Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log detail returned
 */
router.get("/audit-logs/:id", getAuditLogDetail);

/**
 * @openapi
 * /api/v1/admin/security/users/{id}/export:
 *   get:
 *     summary: Export full user account data dump for compliance (GDPR/Data Privacy)
 *     tags: [Admin Audit & Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data package exported
 */
router.get("/security/users/:id/export", exportUserData);

/**
 * @openapi
 * /api/v1/admin/system/health:
 *   get:
 *     summary: System health diagnostics (DB state, uptime, process memory)
 *     tags: [Admin System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status returned
 */
router.get("/system/health", getSystemHealth);

/**
 * @openapi
 * /api/v1/admin/system/config:
 *   get:
 *     summary: Get current application system configuration settings
 *     tags: [Admin System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System configuration returned
 */
router.get("/system/config", getSystemConfig);

/**
 * @openapi
 * /api/v1/admin/system/config:
 *   patch:
 *     summary: Update system settings / maintenance flags
 *     tags: [Admin System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenanceMode:
 *                 type: boolean
 *               allowNewSignups:
 *                 type: boolean
 *               maxListingsPerLandlord:
 *                 type: integer
 *     responses:
 *       200:
 *         description: System configuration updated
 */
router.patch("/system/config", validate(updateSystemConfigSchema), updateSystemConfig);

/**
 * @openapi
 * /api/v1/admin/system/maintenance/purge-soft-deleted:
 *   post:
 *     summary: Purge soft-deleted listings or users older than threshold days
 *     tags: [Admin System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysOld:
 *                 type: integer
 *                 default: 30
 *               target:
 *                 type: string
 *                 enum: [listings, users, all]
 *                 default: all
 *     responses:
 *       200:
 *         description: Purge operation completed
 */
router.post(
  "/system/maintenance/purge-soft-deleted",
  validate(purgeSoftDeletedSchema),
  purgeSoftDeleted
);

export default router;
