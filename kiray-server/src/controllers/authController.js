import { syncUser } from "../services/authService.js";
import { sendSuccess } from "../utils/apiResponse.js";

/**
 * POST /api/v1/auth/sync
 * Syncs the authenticated Firebase user to MongoDB.
 * Creates a new user on first call, updates/restores on subsequent calls.
 */
export const sync = async (req, res, next) => {
  try {
    const user = await syncUser(req.firebaseUid, req.firebaseUser, req.body);
    return sendSuccess(res, 200, "User synced successfully", user);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's profile.
 * Requires full auth (user must already be synced).
 */
export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, "User profile retrieved", req.user);
  } catch (err) {
    next(err);
  }
};
