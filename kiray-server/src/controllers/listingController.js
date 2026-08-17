import Listing from "../models/Listing.js";
import listingService from "../services/listingService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { listingSearchSchema } from "../utils/searchValidators.js";
import { requireOwnerOrAdmin } from "../middleware/listingAccess.js";
import { NotFoundError } from "../utils/errors/index.js";

export const searchNearbyListings = async (req, res, next) => {
  try {
    const parsed = listingSearchSchema.parse(req.query);
    const { results, meta } = await listingService.searchNearbyListings(parsed);

    return sendSuccess(res, 200, "Nearby listings retrieved successfully", {
      data: results,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

export const searchListings = async (req, res, next) => {
  try {
    const parsed = listingSearchSchema.parse(req.query);

    const { results, meta } = await listingService.searchListings(parsed);

    return sendSuccess(res, 200, "Listings retrieved successfully", {
      data: results,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const listing = await listingService.createListing(req.body, req.user._id);
    return sendSuccess(res, 201, "Listing created successfully", listing);
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const updated = await listingService.updateListing(req.listing, req.body);
    return sendSuccess(res, 200, "Listing updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    await listingService.deleteListing(req.listing);
    return sendSuccess(res, 200, "Listing deleted successfully", {});
  } catch (error) {
    next(error);
  }
};

export const restoreListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("ownerId");
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    requireOwnerOrAdmin(listing, req.user);

    const restored = await listingService.restoreListing(listing._id);
    return sendSuccess(res, 200, "Listing restored successfully", restored);
  } catch (error) {
    next(error);
  }
};

export default {
  searchListings,
  searchNearbyListings,
  createListing,
  updateListing,
  deleteListing,
  restoreListing,
};

