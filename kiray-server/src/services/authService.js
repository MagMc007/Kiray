import User from "../models/User.js";

/** 
 * Syncs a Firebase user with the MongoDB user profile.
 * Creates a new user profile on the first call or updates/restores the profile on subsequent calls.
 * 
 * @param {string} firebaseUid - The unique Firebase user ID
 * @param {object} firebaseUser - The decoded Firebase ID token object
 * @param {object} bodyData - The request body (e.g. contains selected role)
 * @returns {Promise<object>} The synced User document
 */
export const syncUser = async (firebaseUid, firebaseUser, bodyData) => {
  let user = await User.findOne({ firebaseUid });

  const displayName =
    firebaseUser.name ||
    firebaseUser.displayName ||
    firebaseUser.email?.split("@")[0] || "Anonymous";
  const email = firebaseUser.email || "";
  const photoURL = firebaseUser.picture || firebaseUser.photoURL || null;

  if (!user) {
    user = await User.create({
      firebaseUid,
      role: bodyData.role,
      displayName,
      email,
      photoURL,
    });
  } else {
    // Restore soft-deleted user if they log back in / sync
    if (user.isDeleted) {
      user.isDeleted = false;
      user.deletedAt = null;
    }

    user.displayName = displayName;
    user.email = email;
    if (photoURL) {
      user.photoURL = photoURL;
    }
    if (bodyData.role) {
      user.role = bodyData.role;
    }
    await user.save();
  }

  return user;
};
