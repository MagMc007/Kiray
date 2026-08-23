import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import Comment from "../src/models/Comment.js";
import Listing from "../src/models/Listing.js";
import {
  recalculateListingRating,
  addComment,
  updateComment,
  deleteComment,
} from "../src/services/commentService.js";

const listingId = "507f191e810c19729de860ea";
const authorId = "507f191e810c19729de860eb";
const commentId = "507f191e810c19729de860ef";

describe("Rating Aggregation Unit Tests", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("recalculateListingRating", () => {
    it("calculates average rating and updates Listing document", async () => {
      const aggregateMock = jest.spyOn(Comment, "aggregate").mockResolvedValue([
        { _id: listingId, averageRating: 4.333, totalComments: 3 },
      ]);
      const updateOneMock = jest.spyOn(Listing, "updateOne").mockResolvedValue({});

      const stats = await recalculateListingRating(listingId);

      expect(aggregateMock).toHaveBeenCalled();
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: listingId },
        {
          $set: {
            averageRating: 4.3,
            totalComments: 3,
          },
        },
      );
      expect(stats).toEqual({ averageRating: 4.3, totalComments: 3 });
    });

    it("resets rating to 0 when no non-deleted comments exist", async () => {
      jest.spyOn(Comment, "aggregate").mockResolvedValue([]);
      const updateOneMock = jest.spyOn(Listing, "updateOne").mockResolvedValue({});

      const stats = await recalculateListingRating(listingId);

      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: listingId },
        {
          $set: {
            averageRating: 0,
            totalComments: 0,
          },
        },
      );
      expect(stats).toEqual({ averageRating: 0, totalComments: 0 });
    });
  });

  describe("Comment operations recalculate rating", () => {
    it("recalculates rating on addComment", async () => {
      const listing = { _id: listingId, isDeleted: false };
      const commentDoc = {
        _id: commentId,
        listingId,
        authorId,
        rating: 5,
        text: "Amazing!",
        verifiedRentee: false,
        populate: jest.fn().mockResolvedValue({ _id: commentId, rating: 5 }),
      };

      jest.spyOn(Listing, "findOne").mockResolvedValue(listing);
      jest.spyOn(Comment, "findOne").mockResolvedValue(null);
      jest.spyOn(Comment, "create").mockResolvedValue(commentDoc);
      jest.spyOn(Comment, "aggregate").mockResolvedValue([
        { _id: listingId, averageRating: 5, totalComments: 1 },
      ]);
      const updateOneMock = jest.spyOn(Listing, "updateOne").mockResolvedValue({});

      await addComment(listingId, authorId, { rating: 5, text: "Amazing!" });

      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: listingId },
        { $set: { averageRating: 5, totalComments: 1 } },
      );
    });

    it("recalculates rating on updateComment", async () => {
      const commentDoc = {
        _id: commentId,
        listingId,
        authorId: { toString: () => authorId },
        rating: 3,
        text: "Okay",
        save: jest.fn().mockResolvedValue(),
        populate: jest.fn().mockResolvedValue({ _id: commentId, rating: 5 }),
      };

      jest.spyOn(Comment, "findOne").mockResolvedValue(commentDoc);
      jest.spyOn(Comment, "aggregate").mockResolvedValue([
        { _id: listingId, averageRating: 5, totalComments: 1 },
      ]);
      const updateOneMock = jest.spyOn(Listing, "updateOne").mockResolvedValue({});

      await updateComment(commentId, authorId, { rating: 5 });

      expect(commentDoc.rating).toBe(5);
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: listingId },
        { $set: { averageRating: 5, totalComments: 1 } },
      );
    });

    it("recalculates rating on deleteComment", async () => {
      const commentDoc = {
        _id: commentId,
        listingId,
        authorId: { toString: () => authorId },
        isDeleted: false,
        deletedAt: null,
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Comment, "findOne").mockResolvedValue(commentDoc);
      jest.spyOn(Comment, "aggregate").mockResolvedValue([]);
      const updateOneMock = jest.spyOn(Listing, "updateOne").mockResolvedValue({});

      await deleteComment(commentId, authorId, "rentee");

      expect(commentDoc.isDeleted).toBe(true);
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: listingId },
        { $set: { averageRating: 0, totalComments: 0 } },
      );
    });
  });
});
