import { Router } from "express";
import { sync, getMe } from "../../controllers/authController.js";
import verifyAuth, {
  verifyFirebaseToken,
} from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { syncSchema } from "../../utils/validators.js";

const router = Router();

/**
 * @openapi
 * /api/v1/auth/sync:
 *   post:
 *     summary: Sync Firebase user to MongoDB
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [landlord, rentee, admin]
 *                 example: landlord
 *             example:
 *               role: landlord
 *     responses:
 *       200:
 *         description: User synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               success: true
 *               message: User synced successfully
 *               data:
 *                 _id: "64b0d6f9e4b0f2b7c8a1d2e3"
 *                 firebaseUid: "firebase-user-id"
 *                 role: "landlord"
 *                 displayName: "Example User"
 *                 email: "user@example.com"
 *                 profileCompleted: false
 */
router.post("/sync", verifyFirebaseToken, validate(syncSchema), sync);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get("/me", verifyAuth, getMe);

export default router;
