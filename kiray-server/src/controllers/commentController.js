import { sendSuccess } from "../utils/apiResponse.js";
import {
  addComment,
  getListingComments,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
} from "../services/commentService.js";

export const createComment = async (req, res, next) => {
  try {
    const listingId = req.params.id || req.params.listingId;
    const authorId = req.user._id;
    const comment = await addComment(listingId, authorId, req.body);
    return sendSuccess(res, 201, "Comment created successfully", comment);
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const listingId = req.params.id || req.params.listingId;
    const result = await getListingComments(listingId, req.query);
    return sendSuccess(res, 200, "Comments retrieved successfully", result);
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const comment = await updateCommentService(commentId, userId, req.body);
    return sendSuccess(res, 200, "Comment updated successfully", comment);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const result = await deleteCommentService(commentId, userId, userRole);
    return sendSuccess(res, 200, "Comment deleted successfully", result);
  } catch (err) {
    next(err);
  }
};

export default {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
