import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import Comment from "../src/models/Comment.js";
import Listing from "../src/models/Listing.js";
import {
  addComment,
  getListingComments,
  updateComment,
  deleteComment,
} from "../src/services/commentService.js";
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} from "../src/utils/errors/index.js";

const listingId = "507f191e810c19729de860ea";
const authorId = "507f191e810c19729de860eb";
const otherUserId = "507f191e810c19729de860ec";
const adminUserId = "507f191e810c19729de860ed";
const commentId = "507f191e810c19729de860ef";

describe("Comment Service Unit Tests", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Comment, "aggregate").mockResolvedValue([]);
    jest.spyOn(Listing, "updateOne").mockResolvedValue({});
  });

  describe("addComment", () => {
    it("creates a comment for an existing listing", async () => {
      const listing = { _id: listingId, isDeleted: false };
      const commentDoc = {
        _id: commentId,
        listingId,
        authorId,
        rating: 5,
        text: "Great experience!",
        verifiedRentee: false,
        populate: jest.fn().mockResolvedValue({
          _id: commentId,
          listingId,
          authorId: { _id: authorId, displayName: "Jane Doe" },
          rating: 5,
          text: "Great experience!",
        }),
      };

      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);
      jest.spyOn(Comment, "findOne").mockResolvedValue(null);
      jest.spyOn(Comment, "create").mockResolvedValue(commentDoc);

      const result = await addComment(listingId, authorId, {
        rating: 5,
        text: "Great experience!",
      });

      expect(Listing.findOne).toHaveBeenCalledWith({
        _id: listingId,
        isDeleted: false,
      });
      expect(Comment.create).toHaveBeenCalledWith({
        listingId,
        authorId,
        rating: 5,
        text: "Great experience!",
        verifiedRentee: false,
      });
      expect(result.rating).toBe(5);
    });

    it("throws NotFoundError if listing does not exist", async () => {
      jest.spyOn(Listing, "findOne").mockResolvedValue(null);

      await expect(
        addComment(listingId, authorId, { rating: 5, text: "Awesome!" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ConflictError if user has already commented", async () => {
      const listing = { _id: listingId, isDeleted: false };
      const existingComment = { _id: commentId, listingId, authorId };

      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);
      jest.spyOn(Comment, "findOne").mockResolvedValue(existingComment);

      await expect(
        addComment(listingId, authorId, { rating: 5, text: "Awesome!" }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("getListingComments", () => {
    it("returns paginated comments for a listing", async () => {
      const listing = { _id: listingId, isDeleted: false };
      const commentQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([
          {
            _id: commentId,
            rating: 5,
            text: "Nice stay",
            authorId: { displayName: "Jane" },
          },
        ]),
      };

      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);
      jest.spyOn(Comment, "countDocuments").mockResolvedValue(1);
      jest.spyOn(Comment, "find").mockReturnValue(commentQuery);

      const result = await getListingComments(listingId, { page: 1, limit: 10 });

      expect(result.comments).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        totalPages: 1,
        totalItems: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("throws NotFoundError if listing is missing", async () => {
      jest.spyOn(Listing, "findOne").mockResolvedValue(null);

      await expect(getListingComments(listingId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateComment", () => {
    it("updates rating and text when called by author", async () => {
      const commentDoc = {
        _id: commentId,
        authorId: { toString: () => authorId },
        rating: 3,
        text: "Old text",
        save: jest.fn().mockResolvedValue(),
        populate: jest.fn().mockResolvedValue({
          _id: commentId,
          rating: 4,
          text: "Updated text",
        }),
      };

      jest.spyOn(Comment, "findOne").mockResolvedValue(commentDoc);

      const result = await updateComment(commentId, authorId, {
        rating: 4,
        text: "Updated text",
      });

      expect(commentDoc.rating).toBe(4);
      expect(commentDoc.text).toBe("Updated text");
      expect(commentDoc.save).toHaveBeenCalled();
      expect(result.text).toBe("Updated text");
    });

    it("throws UnauthorizedError when called by non-author", async () => {
      const commentDoc = {
        _id: commentId,
        authorId: { toString: () => authorId },
      };

      jest.spyOn(Comment, "findOne").mockResolvedValue(commentDoc);

      await expect(
        updateComment(commentId, otherUserId, { text: "Hacked!" }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("deleteComment", () => {
    it("soft deletes comment when called by author", async () => {
      const commentDoc = {
        _id: commentId,
        authorId: { toString: () => authorId },
        isDeleted: false,
        deletedAt: null,
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Comment, "findOne").mockResolvedValue(commentDoc);

      const result = await deleteComment(commentId, authorId, "rentee");

      expect(commentDoc.isDeleted).toBe(true);
      expect(commentDoc.deletedAt).toBeInstanceOf(Date);
      expect(commentDoc.save).toHaveBeenCalled();
      expect(result.message).toBe("Comment deleted successfully");
    });

    it("soft deletes comment when called by admin", async () => {
      const commentDoc = {
        _id: commentId,
        authorId: { toString: () => authorId },
        isDeleted: false,
        deletedAt: null,
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Comment, "findOne").mockResolvedValue(commentDoc);

      const result = await deleteComment(commentId, adminUserId, "admin");

      expect(commentDoc.isDeleted).toBe(true);
      expect(result.message).toBe("Comment deleted successfully");
    });

    it("throws UnauthorizedError when non-author and non-admin attempts delete", async () => {
      const commentDoc = {
        _id: commentId,
        authorId: { toString: () => authorId },
      };

      jest.spyOn(Comment, "findOne").mockResolvedValue(commentDoc);

      await expect(
        deleteComment(commentId, otherUserId, "rentee"),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
