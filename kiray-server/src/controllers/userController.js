import { sendSuccess } from "../utils/apiResponse.js";
import {
  getPublicProfile,
  updateOwnProfile,
  updateOwnContactInfo,
  deleteOwnAccount,
} from "../services/userService.js";

export const getUserById = async (req, res, next) => {
  try {
    const profile = await getPublicProfile(req.params.id);
    return sendSuccess(res, 200, "User profile retrieved", profile);
  } catch (err) {
    next(err);
  }
};

// needs getUserListingsByID here

export const updateMe = async (req, res, next) => {
  try {
    const user = await updateOwnProfile(req.firebaseUid, req.body);
    return sendSuccess(res, 200, "Profile updated successfully", user);
  } catch (err) {
    next(err);
  }
};

export const updateMyContact = async (req, res, next) => {
  try {
    const user = await updateOwnContactInfo(req.firebaseUid, req.body);
    return sendSuccess(res, 200, "Contact info updated successfully", user);
  } catch (err) {
    next(err);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    const user = await deleteOwnAccount(req.firebaseUid);
    return sendSuccess(res, 200, "Account deleted successfully", user);
  } catch (err) {
    next(err);
  }
};
