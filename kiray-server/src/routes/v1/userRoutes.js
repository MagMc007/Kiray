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
