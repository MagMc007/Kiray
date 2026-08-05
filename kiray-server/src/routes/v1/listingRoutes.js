import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import {
  loadListing,
  requireOwnerOrAdmin,
} from "../../middleware/listingAccess.js";
import { sendSuccess } from "../../utils/apiResponse.js";

const router = Router();

router.param("id", loadListing);

/**
 * @openapi
 * /api/v1/listings/{id}:
 *   get:
 *     summary: Get a single listing by ID or slug
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID or slug
 *     responses:
 *       200:
 *         description: Listing retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing retrieved successfully
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   slug: sunny-apartment
 *                   title: Sunny apartment
 *                   description: Bright two-bedroom apartment in a quiet neighborhood
 *                   price: 1200
 *                   propertyType: apartment
 *                   bedrooms: 2
 *                   bathrooms: 1
 *                   status: open
 *                   isDeleted: false
 */
router.get("/:id", (req, res) => {
  return sendSuccess(res, 200, "Listing retrieved successfully", req.listing);
});

/**
 * @openapi
 * /api/v1/listings/{id}:
 *   put:
 *     summary: Update a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: Updated apartment title
 *               price: 1300
 *               bedrooms: 3
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing updated successfully
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   title: Updated apartment title
 *                   price: 1300
 */
router.put("/:id", verifyAuth, (req, res) => {
  requireOwnerOrAdmin(req.listing, req.user);
  return sendSuccess(res, 200, "Listing update endpoint placeholder", {
    listing: req.listing,
    updatedFields: req.body,
  });
});

/**
 * @openapi
 * /api/v1/listings/{id}:
 *   delete:
 *     summary: Delete a listing by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing deleted successfully
 *                 data: {}
 */
router.delete("/:id", verifyAuth, (req, res) => {
  requireOwnerOrAdmin(req.listing, req.user);
  return sendSuccess(res, 200, "Listing delete endpoint placeholder", {});
});

export default router;
