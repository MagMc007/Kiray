import listingService from "../services/listingService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { listingSearchSchema } from "../utils/searchValidators.js";

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

export default { searchListings };
