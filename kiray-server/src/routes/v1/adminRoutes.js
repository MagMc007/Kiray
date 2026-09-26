import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/listingAccess.js";
import validate from "../../middleware/validateMiddleware.js";
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
  adminListingOverrideSchema,
  statusUpdateSchema,
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

/* ==========================================================================
   Module 1: Admin Dashboard & Analytics
   ========================================================================== */

/**
 * @openapi
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get overall admin dashboard overview metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
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
 *     summary: Get activity timeseries analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d, 6m, 1y]
 *           default: 30d
 *         description: Analytics time range window
 *     responses:
 *       200:
 *         description: Activity analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/analytics/activity", getActivityAnalytics);

/* ==========================================================================
   Module 2: User Moderation & Management
   ========================================================================== */

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     summary: Get paginated list of users with filtering and search
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/users", listUsers);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user detailed profile with listing and report statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User Mongo ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/users/:id", getUserDetail);

/**
 * @openapi
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     summary: Update user account status (active, suspended, banned)
 *     tags: [Admin]
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
 *         description: User status updated successfully
 *       400:
 *         description: Validation error or self-modification attempt
 *       404:
 *         description: User not found
 */
router.patch("/users/:id/status", validate(updateUserStatusSchema), updateUserStatus);

/**
 * @openapi
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role (landlord, rentee, admin)
 *     tags: [Admin]
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
 *       400:
 *         description: Validation error or self-role change attempt
 *       404:
 *         description: User not found
 */
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Soft-delete user profile and deactivate owned listings
 *     tags: [Admin]
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
 *         description: User account soft-deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", deleteUser);

/**
 * @openapi
 * /api/v1/admin/users/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted user account
 *     tags: [Admin]
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
 *         description: User account restored successfully
 *       404:
 *         description: User not found
 */
router.patch("/users/:id/restore", restoreUser);

/* ==========================================================================
   Module 3: Listing Moderation & Override
   ========================================================================== */

/**
 * @openapi
 * /api/v1/admin/listings:
 *   get:
 *     summary: Get paginated list of all listings for administrative moderation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin listings retrieved successfully
 */
router.get("/listings", listAdminListings);

/**
 * @openapi
 * /api/v1/admin/listings/{id}:
 *   get:
 *     summary: Get listing detail along with full moderation report history
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID or slug
 *     responses:
 *       200:
 *         description: Listing details and reports retrieved
 *       404:
 *         description: Listing not found
 */
router.get("/listings/:id", getAdminListingDetail);

/**
 * @openapi
 * /api/v1/admin/listings/{id}:
 *   put:
 *     summary: Override listing details as administrator
 *     tags: [Admin]
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
 *     responses:
 *       200:
 *         description: Listing overridden successfully
 *       404:
 *         description: Listing not found
 */
router.put("/listings/:id", validate(adminListingOverrideSchema), updateListingOverride);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/status:
 *   patch:
 *     summary: Direct status update for a listing
 *     tags: [Admin]
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
 *         description: Listing status updated successfully
 *       404:
 *         description: Listing not found
 */
router.patch("/listings/:id/status", validate(statusUpdateSchema), updateListingStatus);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/verify:
 *   post:
 *     summary: Toggle or set listing verification status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVerified:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Listing verification updated
 *       404:
 *         description: Listing not found
 */
router.post("/listings/:id/verify", verifyListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/feature:
 *   patch:
 *     summary: Toggle or set listing featured status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isFeatured:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Listing featured status updated
 *       404:
 *         description: Listing not found
 */
router.patch("/listings/:id/feature", featureListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/deactivate:
 *   patch:
 *     summary: Deactivate listing with an administrative reason (takedown)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Listing deactivated by admin
 *       404:
 *         description: Listing not found
 */
router.patch("/listings/:id/deactivate", deactivateListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted or admin-deactivated listing
 *     tags: [Admin]
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
 *       404:
 *         description: Listing not found
 */
router.patch("/listings/:id/restore", restoreListing);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/hard-delete:
 *   delete:
 *     summary: Permanently delete a listing and remove all Cloudinary assets
 *     tags: [Admin]
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
 *         description: Listing permanently deleted
 *       404:
 *         description: Listing not found
 */
router.delete("/listings/:id/hard-delete", hardDeleteListing);

/* ==========================================================================
   Module 4: Flag & Moderation Management
   ========================================================================== */

/**
 * @openapi
 * /api/v1/admin/flagged:
 *   get:
 *     summary: Get all flagged listings for moderation review (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Flagged listings retrieved successfully
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - admin access required
 */
router.get("/flagged", getFlaggedListings);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/flags:
 *   get:
 *     summary: Get moderation reports submitted for a specific listing (paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID or slug
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page (max 50)
 *     responses:
 *       200:
 *         description: Listing reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing reports retrieved successfully
 *                 data:
 *                   listing:
 *                     _id: "507f191e810c19729de860ea"
 *                     title: "Modern 2 Bedroom Apartment"
 *                     slug: "modern-2-bedroom-apartment"
 *                     isFlagged: true
 *                     flagReason: "Inappropriate content"
 *                   reports:
 *                     - _id: "60d0fe4f5311236168a109cc"
 *                       reason: "Misleading price"
 *                   meta:
 *                     page: 1
 *                     totalPages: 1
 *                     totalItems: 1
 *                     hasNext: false
 *                     hasPrev: false
 *       404:
 *         description: Listing not found
 */
router.get("/listings/:id/flags", getListingReports);

/**
 * @openapi
 * /api/v1/admin/listings/{id}/resolve:
 *   patch:
 *     summary: Resolve flags on a listing and restore or deactivate status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID or slug
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Verified owner identity and pricing details
 *               action:
 *                 type: string
 *                 enum: [dismiss, deactivate, restore]
 *                 default: dismiss
 *     responses:
 *       200:
 *         description: Listing flags resolved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Listing not found
 */
router.patch("/listings/:id/resolve", validate(resolveFlagsSchema), resolveListingFlags);

/* ==========================================================================
   Module 5: Audit Log & Security Compliance
   ========================================================================== */

/**
 * @openapi
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Get paginated administrative audit logs with filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [User, Listing, Report, SystemConfig]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get("/audit-logs", listAuditLogs);

/**
 * @openapi
 * /api/v1/admin/audit-logs/{id}:
 *   get:
 *     summary: Get single audit log details by ID
 *     tags: [Admin]
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
 *         description: Audit log detail retrieved
 *       404:
 *         description: Audit log entry not found
 */
router.get("/audit-logs/:id", getAuditLogDetail);

/**
 * @openapi
 * /api/v1/admin/security/users/{id}/export:
 *   get:
 *     summary: Export comprehensive user data package for GDPR/compliance requests
 *     tags: [Admin]
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
 *         description: User account data exported successfully
 *       404:
 *         description: User not found
 */
router.get("/security/users/:id/export", exportUserData);

/* ==========================================================================
   Module 6: System Configuration & Maintenance
   ========================================================================== */

/**
 * @openapi
 * /api/v1/admin/system/health:
 *   get:
 *     summary: Get system health status (database connection, uptime, memory)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 */
router.get("/system/health", getSystemHealth);

/**
 * @openapi
 * /api/v1/admin/system/config:
 *   get:
 *     summary: Get active global system configuration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System configuration retrieved successfully
 */
router.get("/system/config", getSystemConfig);

/**
 * @openapi
 * /api/v1/admin/system/config:
 *   patch:
 *     summary: Update global system configuration parameters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
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
 *         description: System configuration updated successfully
 */
router.patch("/system/config", validate(updateSystemConfigSchema), updateSystemConfig);

/**
 * @openapi
 * /api/v1/admin/system/maintenance/purge-soft-deleted:
 *   post:
 *     summary: Permanently purge soft-deleted records older than a specified threshold
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
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
 *         description: Soft-deleted records purged successfully
 */
router.post("/system/maintenance/purge-soft-deleted", validate(purgeSoftDeletedSchema), purgeSoftDeleted);

export default router;
