import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Listing from "../models/Listing.js";
import { buildPagination } from "../utils/pagination.js";
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} from "../utils/errors/index.js";
import cacheService from "./cacheService.js";

export const recalculateListingRating = async (listingId) => {
  const listingObjectId =
    typeof listingId === "string"
      ? new mongoose.Types.ObjectId(listingId)
      : listingId;

  const stats = await Comment.aggregate([
    {
      $match: {
        listingId: listingObjectId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$listingId",
        averageRating: { $avg: "$rating" },
        totalComments: { $sum: 1 },
      },
    },
  ]);

  const rawAvg = stats.length > 0 ? stats[0].averageRating : 0;
  const totalComments = stats.length > 0 ? stats[0].totalComments : 0;
  const averageRating = Math.round(rawAvg * 10) / 10;

  await Listing.updateOne(
    { _id: listingId },
    {
      $set: {
        averageRating,
        totalComments,
      },
    },
  );

  return { averageRating, totalComments };
};

export const addComment = async (listingId, authorId, data) => {
  const listing = await Listing.findOne({ _id: listingId, isDeleted: false });
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  const existingComment = await Comment.findOne({
    listingId,
    authorId,
    isDeleted: false,
  });

  if (existingComment) {
    throw new ConflictError("You have already reviewed this listing");
  }

  try {
    const comment = await Comment.create({
      listingId,
      authorId,
      rating: data.rating,
      text: data.text,
      verifiedRentee: data.verifiedRentee || false,
    });

    await recalculateListingRating(listingId);
    await cacheService.delByPattern(`comments:listing:${listingId}*`);
    await cacheService.delByPattern(`listings:detail:${listingId}*`);
    await cacheService.delByPattern("listings:query:*");

    return await comment.populate("authorId", "displayName photoURL");
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError("You have already reviewed this listing");
    }
    throw error;
  }
};

export const getListingComments = async (listingId, opts = {}) => {
  const listing = await Listing.findOne({ _id: listingId, isDeleted: false });
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  const page = Math.max(1, Number(opts.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(opts.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = { listingId, isDeleted: false };
  const total = await Comment.countDocuments(filter);

  const comments = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("authorId", "displayName photoURL");

  return {
    comments,
    pagination: buildPagination(page, limit, total),
  };
};

export const updateComment = async (commentId, userId, data) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  const isAuthor = comment.authorId.toString() === userId.toString();
  if (!isAuthor) {
    throw new UnauthorizedError("Not authorized to update this review");
  }

  if (data.rating !== undefined) comment.rating = data.rating;
  if (data.text !== undefined) comment.text = data.text;
  if (data.verifiedRentee !== undefined)
    comment.verifiedRentee = data.verifiedRentee;

  await comment.save();
  await recalculateListingRating(comment.listingId);
  await cacheService.delByPattern(`comments:listing:${comment.listingId}*`);
  await cacheService.delByPattern(`listings:detail:${comment.listingId}*`);
  await cacheService.delByPattern("listings:query:*");

  return await comment.populate("authorId", "displayName photoURL");
};

export const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  const isAuthor = comment.authorId.toString() === userId.toString();
  const isAdmin = userRole === "admin";

  if (!isAuthor && !isAdmin) {
    throw new UnauthorizedError("Not authorized to delete this review");
  }

  comment.isDeleted = true;
  comment.deletedAt = new Date();
  await comment.save();

  await recalculateListingRating(comment.listingId);
  await cacheService.delByPattern(`comments:listing:${comment.listingId}*`);
  await cacheService.delByPattern(`listings:detail:${comment.listingId}*`);
  await cacheService.delByPattern("listings:query:*");

  return { message: "Comment deleted successfully" };
};

export default {
  recalculateListingRating,
  addComment,
  getListingComments,
  updateComment,
  deleteComment,
};
