import { Router } from "express";
import { sync, getMe } from "../../controllers/authController.js";
import verifyAuth, { verifyFirebaseToken } from "../../middleware/authMiddleware.js";
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
 *                 enum: [renter, rentee]
 *     responses:
 *       200:
 *         description: User synced successfully
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
