import listingService from "../services/listingService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const searchListings = async (req, res, next) => {
  try {
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
      page,
      limit,
      sort,
    } = req.query;

    const { results, meta } = await listingService.searchListings({
      q,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      propertyType,
      lat,
      lng,
      radius,
      page,
      limit,
      sort,
    });

    return sendSuccess(res, 200, "Listings retrieved successfully", {
      data: results,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

export default { searchListings };
