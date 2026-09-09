import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import {
  searchListings,
  searchNearbyListings,
  createListing,
  updateListing,
  deleteListing,
  restoreListing,
} from "../../controllers/listingController.js";
import {
  loadListing,
  requireOwnerOrAdmin,
  requireRole,
} from "../../middleware/listingAccess.js";
import { upload, uploadImages } from "../../middleware/uploadMiddleware.js";
import { removeListingImage } from "../../services/listingImageService.js";
import {
  saveListing,
  unsaveListing,
} from "../../services/favoriteService.js";
import {
  incrementViewCount,
  incrementContactClick,
  flagListing,
  markAsStatus,
  getSimilarListings,
} from "../../services/listingService.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import validate from "../../middleware/validateMiddleware.js";
import { uploadLimiter } from "../../middleware/rateLimiters.js";
import {
  createListingSchema,
  updateListingSchema,
  statusUpdateSchema,
} from "../../utils/validators.js";
import { NotFoundError } from "../../utils/errors/index.js";
import cacheResponse from "../../middleware/cacheMiddleware.js";

const TTL_LISTINGS = Number(process.env.REDIS_TTL_LISTINGS) || 60;
const TTL_LISTING_DETAIL = 300;

const router = Router();

router.param("id", loadListing);

/**
 * @openapi
 * /api/v1/listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - propertyType
 *               - bedrooms
 *               - bathrooms
 *               - location
 *               - address
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Modern 2 Bedroom Apartment"
 *               description:
 *                 type: string
 *                 example: "A spacious apartment located in the city center."
 *               price:
 *                 type: number
 *                 example: 15000
 *               currency:
 *                 type: string
 *                 example: "ETB"
 *               propertyType:
 *                 type: string
 *                 enum: [apartment, house, studio, room, villa, condo, other]
 *                 example: "apartment"
 *               bedrooms:
 *                 type: number
 *                 example: 2
 *               bathrooms:
 *                 type: number
 *                 example: 2
 *               area:
 *                 type: number
 *                 example: 120
 *               areaUnit:
 *                 type: string
 *                 enum: [sqm, sqft]
 *                 example: "sqm"
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["wifi", "parking", "security"]
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: "Point"
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [38.7578, 9.03]
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Bole Road"
 *                   city:
 *                     type: string
 *                     example: "Addis Ababa"
 *                   neighborhood:
 *                     type: string
 *                     example: "Bole"
 *                   postalCode:
 *                     type: string
 *                     example: "1000"
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Listing created successfully"
 *                 data:
 *                   type: object
 *                   example:
 *                     _id: "60d0fe4f5311236168a109ca"
 *                     title: "Modern 2 Bedroom Apartment"
 *                     slug: "modern-2-bedroom-apartment"
 *                     description: "A spacious apartment located in the city center."
 *                     price: 15000
 *                     currency: "ETB"
 *                     propertyType: "apartment"
 *                     bedrooms: 2
 *                     bathrooms: 2
 *                     area: 120
 *                     areaUnit: "sqm"
 *                     amenities: ["wifi", "parking", "security"]
 *                     location:
 *                       type: "Point"
 *                       coordinates: [38.7578, 9.03]
 *                     address:
 *                       street: "Bole Road"
 *                       city: "Addis Ababa"
 *                       neighborhood: "Bole"
 *                       postalCode: "1000"
 *                     status: "open"
 *                     isDeleted: false
 *                     ownerId: "60d0fe4f5311236168a109c9"
 */
router.post(
  "/",
  verifyAuth,
  requireRole("landlord"),
  validate(createListingSchema),
  createListing,
);

/**
 * @openapi
 * /api/v1/listings:
 *   get:
 *     summary: Search and filter listings, paginated
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text search on title, description and city
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city (case-insensitive)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: bathrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [apartment, house, studio, room, villa, condo, other]
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma-separated amenities, e.g. wifi,parking,ac
 *       - in: query
 *         name: minArea
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxArea
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, rented, unavailable]
 *         description: Defaults to open
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude (cannot be combined with q)
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude (cannot be combined with q)
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radius in meters, default 5000
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: price_asc | price_desc | newest | oldest | popular | field:asc | field:desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *         headers:
 *           X-Cache:
 *             schema:
 *               type: string
 *               enum: [HIT, MISS, BYPASS]
 *             description: Redis cache status (HIT, MISS, or BYPASS)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listings retrieved successfully
 *                 data:
 *                   data:
 *                     - _id: 507f191e810c19729de860ea
 *                       title: Sunny apartment
 *                       price: 1200
 *                       status: open
 *                   meta:
 *                     page: 1
 *                     limit: 20
 *                     total: 1
 */
// Main listings list endpoint (supports filters, pagination, sort)
router.get("/", cacheResponse("listings:query", TTL_LISTINGS), searchListings);

/**
 * @openapi
 * /api/v1/listings/search:
 *   get:
 *     summary: Search and filter listings (alias of GET /api/v1/listings)
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [apartment, house, studio, room, villa, condo, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, rented, unavailable]
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *         headers:
 *           X-Cache:
 *             schema:
 *               type: string
 *               enum: [HIT, MISS, BYPASS]
 *             description: Redis cache status (HIT, MISS, or BYPASS)
 */
// Backwards-compatible search route
router.get("/search", cacheResponse("listings:query", TTL_LISTINGS), searchListings);

/**
 * @openapi
 * /api/v1/listings/nearby:
 *   get:
 *     summary: Search nearby listings by map coordinates
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           example: 5000
 *     responses:
 *       200:
 *         description: Nearby listings found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Nearby listings retrieved successfully
 *                 data:
 *                   - _id: 507f191e810c19729de860ea
 *                     title: Near apartment
 *                     distance: 2456.8
 *                 meta:
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   radius: 5000
 *                   center:
 *                     lat: 40.7128
 *                     lng: -74.006
 */
router.get("/nearby", searchNearbyListings);

/**
 * @openapi
 * /api/v1/listings/{id}:
 *   get:
 *     summary: Get a single listing by ID or slug
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID or slug
 *     responses:
 *       200:
 *         description: Listing retrieved successfully
 *         headers:
 *           X-Cache:
 *             schema:
 *               type: string
 *               enum: [HIT, MISS, BYPASS]
 *             description: Redis cache status (HIT, MISS, or BYPASS)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing retrieved successfully
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   slug: sunny-apartment
 *                   title: Sunny apartment
 *                   description: Bright two-bedroom apartment in a quiet neighborhood
 *                   price: 1200
 *                   propertyType: apartment
 *                   bedrooms: 2
 *                   bathrooms: 1
 *                   status: open
 *                   isDeleted: false
 */
router.get("/:id", cacheResponse("listings:detail", TTL_LISTING_DETAIL), (req, res) => {
  return sendSuccess(res, 200, "Listing retrieved successfully", req.listing);
});

/**
 * @openapi
 * /api/v1/listings/{id}/similar:
 *   get:
 *     summary: Get similar listings (same property type, price band, location)
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *         description: Search radius in meters, default 5000
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 20
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Similar listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Similar listings retrieved successfully
 *                 data:
 *                   results:
 *                     - _id: 507f191e810c19729de860ec
 *                       title: Similar apartment
 *                       price: 1100
 *                       propertyType: apartment
 *                       status: open
 *                       distance: 1240.5
 *                   meta:
 *                     page: 1
 *                     limit: 20
 *                     total: 3
 */
router.get("/:id/similar", async (req, res, next) => {
  try {
    const result = await getSimilarListings(req.listing, {
      page: req.query.page,
      limit: req.query.limit,
      radius: req.query.radius,
    });
    return sendSuccess(
      res,
      200,
      "Similar listings retrieved successfully",
      result,
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/listings/{id}/images:
 *   post:
 *     summary: Upload images for a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             example:
 *               images: [<binary image files>]
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Images uploaded successfully
 *                 data:
 *                   - url: https://res.cloudinary.com/demo/image/upload/sample.jpg
 *                     publicId: kiray/listings/sample
 *                     originalName: sample.jpg
 *                     order: 0
 */
router.post(
  "/:id/images",
  uploadLimiter,
  verifyAuth,
  upload.array("images", 6),
  uploadImages,
  (req, res) => {
    requireOwnerOrAdmin(req.listing, req.user);

    return sendSuccess(res, 200, "Images uploaded successfully", req.files);
  },
);

/**
 * @openapi
 * /api/v1/listings/{id}/images/{publicId}:
 *   delete:
 *     summary: Remove an image from a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the image
 *     responses:
 *       200:
 *         description: Image removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Image removed successfully
 *                 data: { result: ok }
 */
router.delete("/:id/images/:publicId", verifyAuth, async (req, res, next) => {
  try {
    requireOwnerOrAdmin(req.listing, req.user);
    const { publicId } = req.params;
    const listing = req.listing;

    const index = listing.images.findIndex(
      (img) => img.publicId === publicId,
    );
    if (index === -1) {
      throw new NotFoundError("Image not found on listing");
    }

    await removeListingImage(publicId);

    listing.images.splice(index, 1);
    await listing.save();

    return sendSuccess(res, 200, "Image removed successfully", listing.images);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/listings/{id}/view:
 *   post:
 *     summary: Record a listing view (public)
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: View recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: View recorded
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   viewCount: 5
 */
// Increment view count (public)
router.post("/:id/view", async (req, res, next) => {
  try {
    const listing = req.listing;
    const viewerId = req.user?._id;
    const updated = await incrementViewCount(listing, viewerId);
    return sendSuccess(res, 200, "View recorded", updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/listings/{id}/contact-click:
 *   post:
 *     summary: Record a contact info view (public)
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Contact click recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Contact click recorded
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   contactClickCount: 3
 */
// Contact click tracking (public)
router.post("/:id/contact-click", async (req, res, next) => {
  try {
    const listing = req.listing;
    const updated = await incrementContactClick(listing);
    return sendSuccess(res, 200, "Contact click recorded", updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/listings/{id}/flag:
 *   post:
 *     summary: Flag a listing for review (authenticated)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Suspicious pricing or fraud concern
 *             example:
 *               reason: Suspicious pricing or fraud concern
 *     responses:
 *       200:
 *         description: Listing flagged successfully. Automatically deactivates and notifies owner if 10 flags reached.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing flagged
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   title: Modern 2 Bedroom Apartment
 *                   status: open
 *                   isFlagged: true
 *                   flagReason: Suspicious pricing or fraud concern
 *                   flagCount: 1
 *                   deactivationReason: null
 *                   deactivationMessage: null
 *       400:
 *         description: Only active listings can be flagged
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 error: Only active listings can be flagged
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Listing not found
 */
// Flag listing (authenticated)
router.post("/:id/flag", verifyAuth, async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const listing = req.listing;
    const updated = await flagListing(listing, reason);
    return sendSuccess(res, 200, "Listing flagged", updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/listings/{id}/save:
 *   post:
 *     summary: Save a listing to favorites (authenticated)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID or slug
 *     responses:
 *       200:
 *         description: Listing saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing saved successfully
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   userId: 60d0fe4f5311236168a109c9
 *                   listingId: 507f191e810c19729de860eb
 *                   createdAt: 2025-01-01T12:00:00.000Z
 *                   updatedAt: 2025-01-01T12:00:00.000Z
 */
router.post("/:id/save", verifyAuth, async (req, res, next) => {
  try {
    const favorite = await saveListing(req.user._id, req.listing._id);
    return sendSuccess(res, 200, "Listing saved successfully", favorite);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/listings/{id}/save:
 *   delete:
 *     summary: Remove a listing from favorites (authenticated)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID or slug
 *     responses:
 *       200:
 *         description: Listing removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing removed from favorites
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   userId: 60d0fe4f5311236168a109c9
 *                   listingId: 507f191e810c19729de860eb
 */
router.delete("/:id/save", verifyAuth, async (req, res, next) => {
  try {
    const favorite = await unsaveListing(req.user._id, req.listing._id);
    return sendSuccess(
      res,
      200,
      "Listing removed from favorites",
      favorite,
    );
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/v1/listings/{id}/status:
 *   patch:
 *     summary: Set a listing's status (owner/admin only)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, rented, unavailable]
 *                 example: rented
 *     responses:
 *       200:
 *         description: Listing status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing status updated
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   status: rented
 */
// Status change endpoints (owner/admin only)
router.patch(
  "/:id/status",
  verifyAuth,
  validate(statusUpdateSchema),
  (req, res, next) => {
    try {
      requireOwnerOrAdmin(req.listing, req.user);
      next();
    } catch (err) {
      next(err);
    }
  },
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const updated = await markAsStatus(req.listing, status);
      return sendSuccess(res, 200, "Listing status updated", updated);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @openapi
 * /api/v1/listings/{id}/available:
 *   patch:
 *     summary: Mark a listing as available (owner/admin only)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Listing marked available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing marked available
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   status: open
 */
router.patch(
  "/:id/available",
  verifyAuth,
  (req, res, next) => {
    try {
      requireOwnerOrAdmin(req.listing, req.user);
      next();
    } catch (err) {
      next(err);
    }
  },
  async (req, res, next) => {
    try {
      const updated = await markAsStatus(req.listing, "open");
      return sendSuccess(res, 200, "Listing marked available", updated);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @openapi
 * /api/v1/listings/{id}/rented:
 *   patch:
 *     summary: Mark a listing as rented (owner/admin only)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Listing marked rented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing marked rented
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   status: rented
 */
router.patch(
  "/:id/rented",
  verifyAuth,
  (req, res, next) => {
    try {
      requireOwnerOrAdmin(req.listing, req.user);
      next();
    } catch (err) {
      next(err);
    }
  },
  async (req, res, next) => {
    try {
      const updated = await markAsStatus(req.listing, "rented");
      return sendSuccess(res, 200, "Listing marked rented", updated);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @openapi
 * /api/v1/listings/{id}:
 *   put:
 *     summary: Update a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               title: Updated apartment title
 *               price: 1300
 *               bedrooms: 3
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing updated successfully
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   title: Updated apartment title
 *                   price: 1300
 */
router.put(
  "/:id",
  verifyAuth,
  validate(updateListingSchema),
  (req, res, next) => {
    try {
      requireOwnerOrAdmin(req.listing, req.user);
      next();
    } catch (error) {
      next(error);
    }
  },
  updateListing,
);

/**
 * @openapi
 * /api/v1/listings/{id}:
 *   delete:
 *     summary: Delete a listing by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing deleted successfully
 *                 data: {}
 */
router.delete(
  "/:id",
  verifyAuth,
  (req, res, next) => {
    try {
      requireOwnerOrAdmin(req.listing, req.user);
      next();
    } catch (error) {
      next(error);
    }
  },
  deleteListing,
);

/**
 * @openapi
 * /api/v1/listings/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the soft-deleted listing to restore
 *     responses:
 *       200:
 *         description: Listing restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Listing restored successfully"
 *                 data:
 *                   type: object
 *                   example:
 *                     _id: "60d0fe4f5311236168a109ca"
 *                     title: "Modern 2 Bedroom Apartment"
 *                     isDeleted: false
 *                     deletedAt: null
 */
router.patch("/:id/restore", verifyAuth, restoreListing);

export default router;
