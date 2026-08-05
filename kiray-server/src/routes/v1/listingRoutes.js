import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import {
  loadListing,
  requireOwnerOrAdmin,
} from "../../middleware/listingAccess.js";
import { upload, uploadImages } from "../../middleware/uploadMiddleware.js";
import { removeListingImage } from "../../services/listingImageService.js";
import { sendSuccess } from "../../utils/apiResponse.js";

const router = Router();

router.param("id", loadListing);

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
    const result = await removeListingImage(req.params.publicId);
    return sendSuccess(res, 200, "Image removed successfully", result);
  } catch (error) {
    next(error);
  }
});

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
router.put("/:id", verifyAuth, (req, res) => {
  requireOwnerOrAdmin(req.listing, req.user);
  return sendSuccess(res, 200, "Listing update endpoint placeholder", {
    listing: req.listing,
    updatedFields: req.body,
  });
});

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
router.delete("/:id", verifyAuth, (req, res) => {
  requireOwnerOrAdmin(req.listing, req.user);
  return sendSuccess(res, 200, "Listing delete endpoint placeholder", {});
});

export default router;
