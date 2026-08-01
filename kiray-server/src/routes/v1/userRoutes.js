import { Router } from "express";
import verifyAuth, { verifyFirebaseToken } from "../../middleware/authMiddleware.js";
import {
  getUserById,
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

// get user listings by ID route here


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
