import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import { requireRole } from "../../middleware/listingAccess.js";
import {
  getFlaggedListings,
  resolveFlaggedListing,
} from "../../services/listingService.js";
import { sendSuccess } from "../../utils/apiResponse.js";

const router = Router();

// Protect all admin routes with authentication and admin role check
router.use(verifyAuth, requireRole("admin"));

/**
 * @openapi
 * /api/v1/admin/flagged:
 *   get:
 *     summary: Get all flagged listings for review (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Number of listings per page
 *     responses:
 *       200:
 *         description: Flagged listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Flagged listings retrieved successfully
 *                 data:
 *                   results:
 *                     - _id: 507f191e810c19729de860ea
 *                       title: Modern 2 Bedroom Apartment
 *                       isFlagged: true
 *                       flagReason: Suspicious pricing
 *                       flagCount: 10
 *                       status: unavailable
 *                       deactivationReason: Suspicious pricing
 *                       deactivationMessage: Your listing has been automatically deactivated...
 *                   meta:
 *                     page: 1
 *                     limit: 20
 *                     totalItems: 1
 *                     totalPages: 1
 *                     hasNext: false
 *                     hasPrev: false
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - admin access required
 */
router.get("/flagged", async (req, res, next) => {
  try {
    const result = await getFlaggedListings({
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendSuccess(
      res,
      200,
      "Flagged listings retrieved successfully",
      result,
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/admin/listings/{id}/resolve:
 *   patch:
 *     summary: Resolve flags on a listing and restore status (Admin only)
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
 *             example:
 *               notes: Verified owner identity and pricing details
 *     responses:
 *       200:
 *         description: Listing flags resolved and status restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing flags resolved successfully
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   title: Modern 2 Bedroom Apartment
 *                   status: open
 *                   isFlagged: false
 *                   flagReason: null
 *                   flagCount: 0
 *                   deactivationReason: null
 *                   deactivationMessage: null
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Listing not found
 */
router.patch("/listings/:id/resolve", async (req, res, next) => {
  try {
    const listing = await resolveFlaggedListing(req.params.id);
    return sendSuccess(
      res,
      200,
      "Listing flags resolved successfully",
      listing,
    );
  } catch (err) {
    next(err);
  }
});

export default router;
