import { Router } from "express";
import verifyAuth from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../../utils/validators.js";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../../controllers/commentController.js";

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/v1/listings/{id}/comments:
 *   post:
 *     summary: Add a review/comment to a listing
 *     tags: [Comments]
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
 *             required:
 *               - rating
 *               - text
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               text:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Great place, clean and location is perfect!"
 *               verifiedRentee:
 *                 type: boolean
 *                 example: false
 *           example:
 *             rating: 5
 *             text: "Great place, clean and location is perfect!"
 *             verifiedRentee: false
 *     responses:
 *       201:
 *         description: Comment created successfully
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
 *                   example: "Comment created successfully"
 *                 data:
 *                   type: object
 *             example:
 *               success: true
 *               message: "Comment created successfully"
 *               data:
 *                 _id: "60d0fe4f5311236168a109cb"
 *                 listingId: "507f191e810c19729de860ea"
 *                 authorId:
 *                   _id: "60d0fe4f5311236168a109c9"
 *                   displayName: "John Doe"
 *                   photoURL: "https://example.com/avatar.jpg"
 *                 rating: 5
 *                 text: "Great place, clean and location is perfect!"
 *                 verifiedRentee: false
 *                 isDeleted: false
 *                 createdAt: "2026-08-23T10:00:00.000Z"
 *                 updatedAt: "2026-08-23T10:00:00.000Z"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 *       409:
 *         description: Conflict - Already reviewed this listing
 */
router.post("/", verifyAuth, validate(createCommentSchema), createComment);

/**
 * @openapi
 * /api/v1/listings/{id}/comments:
 *   get:
 *     summary: Get all comments for a listing (paginated)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page (max 50)
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               success: true
 *               message: "Comments retrieved successfully"
 *               data:
 *                 comments:
 *                   - _id: "60d0fe4f5311236168a109cb"
 *                     listingId: "507f191e810c19729de860ea"
 *                     authorId:
 *                       _id: "60d0fe4f5311236168a109c9"
 *                       displayName: "John Doe"
 *                       photoURL: "https://example.com/avatar.jpg"
 *                     rating: 5
 *                     text: "Great place, clean and location is perfect!"
 *                     verifiedRentee: false
 *                     isDeleted: false
 *                     createdAt: "2026-08-23T10:00:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   totalPages: 1
 *                   totalItems: 1
 *                   hasNext: false
 *                   hasPrev: false
 *       404:
 *         description: Listing not found
 */
router.get("/", getComments);

/**
 * @openapi
 * /api/v1/listings/{id}/comments/{commentId}:
 *   put:
 *     summary: Edit own comment
 *     tags: [Comments]
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
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               text:
 *                 type: string
 *                 maxLength: 1000
 *               verifiedRentee:
 *                 type: boolean
 *           example:
 *             rating: 4
 *             text: "Updated review text."
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               success: true
 *               message: "Comment updated successfully"
 *               data:
 *                 _id: "60d0fe4f5311236168a109cb"
 *                 rating: 4
 *                 text: "Updated review text."
 *                 verifiedRentee: false
 *       401:
 *         description: Unauthorized / Not author of comment
 *       404:
 *         description: Comment not found
 */
router.put(
  "/:commentId",
  verifyAuth,
  validate(updateCommentSchema),
  updateComment,
);

/**
 * @openapi
 * /api/v1/listings/{id}/comments/{commentId}:
 *   delete:
 *     summary: Soft-delete own comment (or admin override)
 *     tags: [Comments]
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
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               success: true
 *               message: "Comment deleted successfully"
 *               data:
 *                 message: "Comment deleted successfully"
 *       401:
 *         description: Unauthorized / Not author or admin
 *       404:
 *         description: Comment not found
 */
router.delete("/:commentId", verifyAuth, deleteComment);

export default router;
