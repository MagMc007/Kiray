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
} from "../../middleware/listingAccess.js";
import { upload, uploadImages } from "../../middleware/uploadMiddleware.js";
import { removeListingImage } from "../../services/listingImageService.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import validate from "../../middleware/validateMiddleware.js";
import {
  createListingSchema,
  updateListingSchema,
  statusUpdateSchema,
} from "../../utils/validators.js";
import { NotFoundError } from "../../utils/errors/index.js";

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
router.post("/", verifyAuth, validate(createListingSchema), createListing);

/**
 * GET /api/v1/listings  (also /api/v1/listings/search)
 * Query params: q, city, minPrice, maxPrice, bedrooms, bedrooms_min, bedrooms_max,
 *               bathrooms, propertyType, amenities, minArea, maxArea, status,
 *               lat, lng, radius (meters, default 5000), page, limit (max 50), sort
 * sort: price_asc | price_desc | newest | oldest | popular | field:asc | field:desc
 * Note: q (text search) cannot be combined with lat/lng.
 */
// Main listings list endpoint (supports filters, pagination, sort)
router.get("/", searchListings);

// Backwards-compatible search route
router.get("/search", searchListings);

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
router.get("/:id", (req, res) => {
  return sendSuccess(res, 200, "Listing retrieved successfully", req.listing);
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

// Increment view count (public)
router.post("/:id/view", async (req, res, next) => {
  try {
    const listing = req.listing;
    const viewerId = req.user?._id;
    const updated = await import("../../services/listingService.js").then((m) =>
      m.incrementViewCount(listing, viewerId),
    );
    return sendSuccess(res, 200, "View recorded", updated);
  } catch (err) {
    next(err);
  }
});

// Contact click tracking (public)
router.post("/:id/contact-click", async (req, res, next) => {
  try {
    const listing = req.listing;
    const updated = await import("../../services/listingService.js").then((m) =>
      m.incrementContactClick(listing),
    );
    return sendSuccess(res, 200, "Contact click recorded", updated);
  } catch (err) {
    next(err);
  }
});

// Flag listing (authenticated)
router.post("/:id/flag", verifyAuth, async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const listing = req.listing;
    const updated = await import("../../services/listingService.js").then((m) =>
      m.flagListing(listing, reason),
    );
    return sendSuccess(res, 200, "Listing flagged", updated);
  } catch (err) {
    next(err);
  }
});

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
      const updated = await import("../../services/listingService.js").then(
        (m) => m.markAsStatus(req.listing, status),
      );
      return sendSuccess(res, 200, "Listing status updated", updated);
    } catch (err) {
      next(err);
    }
  },
);

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
      const updated = await import("../../services/listingService.js").then(
        (m) => m.markAsStatus(req.listing, "open"),
      );
      return sendSuccess(res, 200, "Listing marked available", updated);
    } catch (err) {
      next(err);
    }
  },
);

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
      const updated = await import("../../services/listingService.js").then(
        (m) => m.markAsStatus(req.listing, "rented"),
      );
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
