import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import { generateSlug } from "../utils/slugify.js";
import { buildPagination } from "../utils/pagination.js";
import { NotFoundError, ValidationError } from "../utils/errors/index.js";
import logger from "../config/logger.js";

// Returns the great-circle distance between two [lng, lat] coord pairs in meters
const toDistanceMeters = (coordsA, coordsB) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const [lng1, lat1] = coordsA;
  const [lng2, lat2] = coordsB;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c * 1000; // meters
};

// Used to convert a meter-based radius into radians for $centerSphere counts
const EARTH_RADIUS_METERS = 6378137;

const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  popular: { viewCount: -1 },
};

export const searchListings = async (opts = {}) => {
  const {
    ownerId,
    q,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    bedrooms_min,
    bedrooms_max,
    minBedrooms,
    maxBedrooms,
    bathrooms,
    propertyType,
    amenities,
    minArea,
    maxArea,
    status,
    lat,
    lng,
    radius,
    page = 1,
    limit = 20,
    sort,
  } = opts;

  if (q && lat !== undefined && lng !== undefined) {
    throw new ValidationError(
      "Text search (q) cannot be combined with location (lat/lng) filters",
    );
  }

  const filter = { isDeleted: false };

  // Only return open listings by default
  filter.status = "open";

  if (ownerId) {
    filter.ownerId = ownerId;
  }

  if (q) {
    filter.$text = { $search: q };
  }

  if (city) {
    filter["address.city"] = { $regex: new RegExp(city, "i") };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  const bMin = bedrooms_min ?? minBedrooms;
  const bMax = bedrooms_max ?? maxBedrooms;
  if (bedrooms !== undefined) {
    filter.bedrooms = Number(bedrooms);
  }
  if (bMin !== undefined || bMax !== undefined) {
    if (!filter.bedrooms) filter.bedrooms = {};
    if (bMin !== undefined) filter.bedrooms.$gte = Number(bMin);
    if (bMax !== undefined) filter.bedrooms.$lte = Number(bMax);
  }

  if (bathrooms !== undefined) {
    filter.bathrooms = Number(bathrooms);
  }

  if (propertyType) {
    filter.propertyType = propertyType;
  }

  if (amenities) {
    const arr = String(amenities)
      .split(",")
      .map((a) => a.trim());
    filter.amenities = { $all: arr };
  }

  if (minArea !== undefined || maxArea !== undefined) {
    filter.area = {};
    if (minArea !== undefined) filter.area.$gte = Number(minArea);
    if (maxArea !== undefined) filter.area.$lte = Number(maxArea);
  }

  if (status) {
    filter.status = status;
  }

  // Build the base mongo query and the final filter used for counting
  let mongoQuery = Listing.find(filter).populate("ownerId");
  let countFilter = { ...filter };

  // Geo proximity: when lat/lng provided replace the query filter.
  // radius is in meters and defaults to 5000m (5km).
  // Note: $near is illegal inside countDocuments (it uses aggregation), so the
  // count uses the equivalent $geoWithin circle instead.
  if (lat !== undefined && lng !== undefined) {
    const coords = [Number(lng), Number(lat)];
    const maxDistance = radius !== undefined ? Number(radius) : 5000;
    const nearQuery = {
      ...filter,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
          $maxDistance: maxDistance,
        },
      },
    };
    mongoQuery = Listing.find(nearQuery).populate("ownerId");
    countFilter = {
      ...filter,
      location: {
        $geoWithin: { $centerSphere: [coords, maxDistance / EARTH_RADIUS_METERS] },
      },
    };
  }

  // Sorting
  if (sort) {
    const mapped = SORT_OPTIONS[sort];
    if (mapped) {
      mongoQuery = mongoQuery.sort(mapped);
    } else if (sort.includes(":")) {
      // legacy format: field:asc or field:desc
      const [field, direction] = sort.split(":");
      const dir = direction === "asc" ? 1 : -1;
      // when lat/lng provided, $near already orders results by distance
      if (field !== "distance") {
        mongoQuery = mongoQuery.sort({ [field]: dir });
      }
    }
  } else if (q) {
    // when using text search, sort by text score
    mongoQuery = mongoQuery.sort({ score: { $meta: "textScore" } });
    mongoQuery = mongoQuery.select({ score: { $meta: "textScore" } });
  } else {
    mongoQuery = mongoQuery.sort({ createdAt: -1 });
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Number(limit) || 20);

  const skip = (pageNum - 1) * perPage;

  // Count documents using the exact same filter used to fetch results
  const total = await Listing.countDocuments(countFilter);
  const results = await mongoQuery.skip(skip).limit(perPage).lean();

  return {
    results,
    meta: buildPagination(pageNum, perPage, total),
  };
};

export const searchNearbyListings = async (opts = {}) => {
  const {
    lat,
    lng,
    radius = 5000,
    page = 1,
    limit = 20,
    propertyType,
    status = "open",
  } = opts;

  if (lat === undefined || lng === undefined) {
    throw new ValidationError("lat and lng are required for nearby listings");
  }

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const maxDistance = Number(radius) || 5000;

  const filter = {
    isDeleted: false,
    status,
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [parsedLng, parsedLat],
        },
        $maxDistance: maxDistance,
      },
    },
  };

  if (propertyType) {
    filter.propertyType = propertyType;
  }

  // $nearSphere is illegal inside countDocuments (it uses aggregation), so the
  // count uses the equivalent $geoWithin circle instead.
  const countFilter = {
    isDeleted: false,
    status,
    location: {
      $geoWithin: {
        $centerSphere: [
          [parsedLng, parsedLat],
          maxDistance / EARTH_RADIUS_METERS,
        ],
      },
    },
  };

  if (propertyType) {
    countFilter.propertyType = propertyType;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Number(limit) || 20);
  const skip = (pageNum - 1) * perPage;

  const total = await Listing.countDocuments(countFilter);
  const results = await Listing.find(filter)
    .populate("ownerId")
    .skip(skip)
    .limit(perPage)
    .lean();

  const normalizedResults = results.map((listing) => {
    const coordinates = listing.location?.coordinates || [];
    const distance =
      coordinates.length === 2
        ? toDistanceMeters([parsedLng, parsedLat], coordinates)
        : null;

    return {
      ...listing,
      distance,
    };
  });

  return {
    results: normalizedResults,
    meta: {
      ...buildPagination(pageNum, perPage, total),
      radius: maxDistance,
      center: { lat: parsedLat, lng: parsedLng },
    },
  };
};

export const getUserListings = async (userId, opts = {}) => {
  const { page = 1, limit = 20, status } = opts;

  if (!mongoose.isValidObjectId(userId)) {
    throw new NotFoundError("User not found");
  }

  const filter = { ownerId: userId, isDeleted: false };
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Number(limit) || 20);
  const skip = (pageNum - 1) * perPage;

  const total = await Listing.countDocuments(filter);
  const results = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .lean();

  return {
    results,
    meta: buildPagination(pageNum, perPage, total),
  };
};

export const getMyListings = async (userId, opts = {}) => {
  // Owners may also see their soft-deleted listings (management + restore)
  const { page = 1, limit = 20, status } = opts;

  const filter = { ownerId: userId };
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Number(limit) || 20);
  const skip = (pageNum - 1) * perPage;

  const total = await Listing.countDocuments(filter);
  const results = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .lean();

  return {
    results,
    meta: buildPagination(pageNum, perPage, total),
  };
};

export const getSimilarListings = async (listing, opts = {}) => {
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  const { page = 1, limit = 20, radius = 5000 } = opts;

  // Same property type, price band (±25%), and location proximity;
  // the source listing itself and soft-deleted listings are excluded
  const filter = {
    isDeleted: false,
    status: "open",
    _id: { $ne: listing._id },
    propertyType: listing.propertyType,
  };

  if (typeof listing.price === "number") {
    const band = Math.max(0, listing.price * 0.25);
    filter.price = {
      $gte: Math.max(0, listing.price - band),
      $lte: listing.price + band,
    };
  }

  // $near is illegal inside countDocuments (it uses aggregation), so the
  // count uses the equivalent $geoWithin circle instead.
  const coords = listing.location?.coordinates;
  const hasCoords = Array.isArray(coords) && coords.length === 2;
  const maxDistance = Number(radius) || 5000;
  const countFilter = hasCoords
    ? {
        ...filter,
        location: {
          $geoWithin: {
            $centerSphere: [coords, maxDistance / EARTH_RADIUS_METERS],
          },
        },
      }
    : { ...filter };

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Number(limit) || 20);
  const skip = (pageNum - 1) * perPage;

  const total = await Listing.countDocuments(countFilter);

  const baseQuery = hasCoords
    ? Listing.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: coords },
            $maxDistance: maxDistance,
          },
        },
      })
    : Listing.find(filter).sort({ createdAt: -1 });

  const results = await baseQuery.skip(skip).limit(perPage).lean();

  const normalizedResults = results.map((result) => {
    let distance = null;
    if (hasCoords) {
      const resultCoords = result.location?.coordinates || [];
      if (resultCoords.length === 2) {
        distance = toDistanceMeters(coords, resultCoords);
      }
    }
    return { ...result, distance };
  });

  return {
    results: normalizedResults,
    meta: buildPagination(pageNum, perPage, total),
  };
};

export const createListing = async (data, ownerId) => {
  const { title } = data;
  let baseSlug = generateSlug(title);
  if (!baseSlug) {
    baseSlug = "listing";
  }

  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await Listing.findOne({ slug });
    if (!existing) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const listing = new Listing({
    ...data,
    slug,
    ownerId,
  });

  await listing.save();
  return listing;
};

export const updateListing = async (listing, data) => {
  if (data.title && data.title !== listing.title) {
    let baseSlug = generateSlug(data.title);
    if (!baseSlug) {
      baseSlug = "listing";
    }
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await Listing.findOne({ slug });
      if (!existing || existing._id.toString() === listing._id.toString()) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    listing.slug = slug;
  }

  Object.keys(data).forEach((key) => {
    if (key !== "slug" && key !== "ownerId" && key !== "images") {
      listing[key] = data[key];
    }
  });

  await listing.save();
  return listing;
};

export const deleteListing = async (listing) => {
  listing.isDeleted = true;
  listing.deletedAt = new Date();
  await listing.save();
  return listing;
};

export const restoreListing = async (listing) => {
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }
  listing.isDeleted = false;
  listing.deletedAt = null;
  await listing.save();
  return listing;
};

export const markAsStatus = async (listing, status) => {
  if (!listing) throw new NotFoundError("Listing not found");
  listing.status = status;
  await listing.save();
  return listing;
};

export const incrementViewCount = async (listing, viewerId = null) => {
  if (!listing || listing.isDeleted)
    throw new NotFoundError("Listing not found");

  const ownerId =
    listing.ownerId?._id?.toString() || listing.ownerId?.toString();
  if (viewerId && ownerId === viewerId.toString()) {
    return listing; // do not increment when owner views
  }

  listing.viewCount = (listing.viewCount || 0) + 1;
  await listing.save();
  return listing;
};

export const incrementContactClick = async (listing) => {
  if (!listing || listing.isDeleted)
    throw new NotFoundError("Listing not found");
  listing.contactClickCount = (listing.contactClickCount || 0) + 1;
  await listing.save();
  return listing;
};

export const flagListing = async (listing, reason = null) => {
  if (!listing || listing.isDeleted) throw new NotFoundError("Listing not found");

  if (listing.status !== "open") {
    throw new ValidationError("Only active listings can be flagged");
  }

  listing.isFlagged = true;
  listing.flagReason = reason || listing.flagReason || null;
  listing.flagCount = (listing.flagCount || 0) + 1;

  if (listing.flagCount >= 10) {
    listing.status = "unavailable";
    const reasonText = listing.flagReason || "Excessive user flags";
    listing.deactivationReason = reasonText;
    listing.deactivationMessage = `Your listing '${listing.title}' has been automatically deactivated because it received 10 flags for safety or policy violations (Reason: ${reasonText}). Please contact support to review and resolve this issue.`;

    logger.warn(
      { listingId: listing._id, ownerId: listing.ownerId, flagCount: listing.flagCount },
      `Listing auto-deactivated. Notification sent to owner: ${listing.deactivationMessage}`
    );
  }

  await listing.save();
  return listing;
};

export const getFlaggedListings = async (opts = {}) => {
  const { page = 1, limit = 20 } = opts;

  const filter = { isFlagged: true, isDeleted: false };

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Number(limit) || 20);
  const skip = (pageNum - 1) * perPage;

  const total = await Listing.countDocuments(filter);
  const results = await Listing.find(filter)
    .populate("ownerId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .lean();

  return {
    results,
    meta: buildPagination(pageNum, perPage, total),
  };
};

export const resolveFlaggedListing = async (listingOrId) => {
  let listing = listingOrId;

  if (typeof listingOrId === "string" || mongoose.isObjectIdOrHexString(listingOrId)) {
    const query = mongoose.isValidObjectId(listingOrId)
      ? { _id: listingOrId }
      : { slug: listingOrId };
    listing = await Listing.findOne({ ...query, isDeleted: false });
  }

  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  listing.isFlagged = false;
  listing.flagReason = null;
  listing.flagCount = 0;
  listing.deactivationReason = null;
  listing.deactivationMessage = null;

  if (listing.status === "unavailable") {
    listing.status = "open";
  }

  await listing.save();
  return listing;
};

export default {
  searchListings,
  searchNearbyListings,
  getUserListings,
  getMyListings,
  getSimilarListings,
  createListing,
  updateListing,
  deleteListing,
  restoreListing,
  flagListing,
  getFlaggedListings,
  resolveFlaggedListing,
};
