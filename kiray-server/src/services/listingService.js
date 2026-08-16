import Listing from "../models/Listing.js";

export const searchListings = async (opts = {}) => {
  const {
    q,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    propertyType,
    lat,
    lng,
    radius,
    page = 1,
    limit = 10,
    sort,
  } = opts;

  const filter = { isDeleted: false };

  // Only return open listings by default
  filter.status = "open";

  if (q) {
    filter.$text = { $search: q };
  }

  if (city) {
    filter["address.city"] = { $regex: new RegExp(city, "i") };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (bedrooms) {
    filter.bedrooms = Number(bedrooms);
  }

  if (propertyType) {
    filter.propertyType = propertyType;
  }

  let mongoQuery = Listing.find(filter).populate("ownerId");

  // Geo proximity
  if (lat && lng) {
    const coords = [Number(lng), Number(lat)];
    const maxDistance = radius ? Number(radius) : 5000; // meters
    mongoQuery = Listing.find({
      ...filter,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
          $maxDistance: maxDistance,
        },
      },
    }).populate("ownerId");
  }

  // Sorting
  if (sort) {
    // expected format: field:asc or field:desc
    const [field, direction] = sort.split(":");
    const dir = direction === "asc" ? 1 : -1;
    mongoQuery = mongoQuery.sort({ [field]: dir });
  } else if (q) {
    // when using text search, sort by text score
    mongoQuery = mongoQuery.sort({ score: { $meta: "textScore" } });
    mongoQuery = mongoQuery.select({ score: { $meta: "textScore" } });
  } else {
    mongoQuery = mongoQuery.sort({ createdAt: -1 });
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(100, Number(limit) || 10);

  const skip = (pageNum - 1) * perPage;

  const total = await Listing.countDocuments(filter);
  const results = await mongoQuery.skip(skip).limit(perPage).lean();

  return {
    results,
    meta: { page: pageNum, limit: perPage, total },
  };
};

export default { searchListings };
