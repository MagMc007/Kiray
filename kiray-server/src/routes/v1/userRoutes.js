import { Router } from "express";
import verifyAuth, { verifyFirebaseToken } from "../../middleware/authMiddleware.js";
import {
  getUserById,
  getUserListings,
  getMyListings,
  updateMe,
  updateMyContact,
  deleteMe,
} from "../../controllers/userController.js";
import { getSavedListings } from "../../services/favoriteService.js";
import { sendSuccess } from "../../utils/apiResponse.js";

const router = Router();

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a public user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public profile returned
 */
router.get("/:id", getUserById);

/**
 * @openapi
 * /api/v1/users/me/listings:
 *   get:
 *     summary: Get the current user's listings (including soft-deleted)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, rented, unavailable]
 *     responses:
 *       200:
 *         description: My listings retrieved
 */
router.get("/me/listings", verifyAuth, getMyListings);

/**
 * @openapi
 * /api/v1/users/me/saved-listings:
 *   get:
 *     summary: Get the current user's saved listings, paginated
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Saved listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Saved listings retrieved successfully
 *                 data:
 *                   results:
 *                     - _id: 507f191e810c19729de860eb
 *                       title: Sunny apartment
 *                       slug: sunny-apartment
 *                       price: 1200
 *                       propertyType: apartment
 *                       status: open
 *                       saveCount: 1
 *                   meta:
 *                     page: 1
 *                     limit: 20
 *                     total: 1
 */
router.get("/me/saved-listings", verifyAuth, async (req, res, next) => {
  try {
    const result = await getSavedListings(req.user._id, {
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendSuccess(res, 200, "Saved listings retrieved successfully", result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/users/{id}/listings:
 *   get:
 *     summary: Get all public listings by a user (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User listings retrieved
 */
router.get("/:id/listings", getUserListings);


/**
 * @openapi
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/me", verifyFirebaseToken, updateMe);

/**
 * @openapi
 * /api/v1/users/me/contact:
 *   put:
 *     summary: Update current user contact info
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact info updated successfully
 */
router.put("/me/contact", verifyFirebaseToken, updateMyContact);

/**
 * @openapi
 * /api/v1/users/me:
 *   delete:
 *     summary: Soft-delete current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete("/me", verifyFirebaseToken, deleteMe);

export default router;
