import { Router } from "express";
import { sync, getMe } from "../../controllers/authController.js";
import verifyAuth, { verifyFirebaseToken } from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { syncSchema } from "../../utils/validators.js";

const router = Router();

// POST /api/v1/auth/sync
// Uses verifyFirebaseToken (token-only) because the user may not exist in MongoDB yet
router.post("/sync", verifyFirebaseToken, validate(syncSchema), sync);

// GET /api/v1/auth/me
// Uses verifyAuth (full auth) because the user must already be synced
router.get("/me", verifyAuth, getMe);

export default router;
