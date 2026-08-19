import Favorite from "../models/Favorite.js";
import Listing from "../models/Listing.js";
import { NotFoundError } from "../utils/errors/index.js";

export const saveListing = async (userId, listingId) => {
  const existing = await Favorite.findOne({ userId, listingId });
  if (existing) {
    return existing; // duplicate save is a no-op
  }

  const favorite = await Favorite.create({ userId, listingId });

  await Listing.updateOne({ _id: listingId }, { $inc: { saveCount: 1 } });

  return favorite;
};

export const unsaveListing = async (userId, listingId) => {
  const favorite = await Favorite.findOneAndDelete({ userId, listingId });
  if (!favorite) {
    throw new NotFoundError("Saved listing not found");
  }

  await Listing.updateOne(
    { _id: listingId, saveCount: { $gt: 0 } },
    { $inc: { saveCount: -1 } },
  );

  return favorite;
};

export const getSavedListings = async (userId, opts = {}) => {
  const { page = 1, limit = 20 } = opts;

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Number(limit) || 20);
  const skip = (pageNum - 1) * perPage;

  const filter = { userId };
  const total = await Favorite.countDocuments(filter);
  const favorites = await Favorite.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .lean();

  // Only return active listings; soft-deleted ones are dropped from results
  const listingIds = favorites.map((favorite) => favorite.listingId);
  const listings = listingIds.length
    ? await Listing.find({
        _id: { $in: listingIds },
        isDeleted: false,
      }).lean()
    : [];

  const listingMap = new Map(
    listings.map((listing) => [String(listing._id), listing]),
  );

  const results = favorites
    .filter((favorite) => listingMap.has(String(favorite.listingId)))
    .map((favorite) => listingMap.get(String(favorite.listingId)));

  return {
    results,
    meta: { page: pageNum, limit: perPage, total },
  };
};

export default { saveListing, unsaveListing, getSavedListings };