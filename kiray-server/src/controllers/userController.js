import { sendSuccess } from "../utils/apiResponse.js";
import {
  getPublicProfile,
  updateOwnProfile,
  updateOwnContactInfo,
  deleteOwnAccount,
} from "../services/userService.js";
import listingService from "../services/listingService.js";
import { ValidationError } from "../utils/errors/index.js";

const LISTING_STATUSES = ["open", "rented", "unavailable"];

const parseListingsQuery = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Number(query.limit) || 20);
  const status = query.status;
  if (status !== undefined && !LISTING_STATUSES.includes(status)) {
    throw new ValidationError("Invalid status filter");
  }
  return { page, limit, status };
};

export const getUserById = async (req, res, next) => {
  try {
    const profile = await getPublicProfile(req.params.id);
    return sendSuccess(res, 200, "User profile retrieved", profile);
  } catch (err) {
    next(err);
  }
};

export const getUserListings = async (req, res, next) => {
  try {
    const { page, limit, status } = parseListingsQuery(req.query);
    const { results, meta } = await listingService.getUserListings(
      req.params.id,
      { page, limit, status },
    );
    return sendSuccess(res, 200, "User listings retrieved", {
      data: results,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const { page, limit, status } = parseListingsQuery(req.query);
    const { results, meta } = await listingService.getMyListings(
      req.user._id,
      { page, limit, status },
    );
    return sendSuccess(res, 200, "My listings retrieved", {
      data: results,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

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
