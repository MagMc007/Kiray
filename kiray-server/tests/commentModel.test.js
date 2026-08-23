import { describe, it, expect } from "@jest/globals";
import mongoose from "mongoose";
import Comment from "../src/models/Comment.js";

describe("Comment model", () => {
  it("validates required comment fields and applies default values", async () => {
    const comment = new Comment({
      listingId: new mongoose.Types.ObjectId(),
      authorId: new mongoose.Types.ObjectId(),
      rating: 5,
      text: "Great property, smooth experience!",
    });

    let validationError;
    try {
      await comment.validate();
    } catch (err) {
      validationError = err;
    }

    expect(validationError).toBeUndefined();
    expect(comment.rating).toBe(5);
    expect(comment.verifiedRentee).toBe(false);
    expect(comment.isDeleted).toBe(false);
    expect(comment.deletedAt).toBeNull();
  });

  it("fails validation when required fields are missing", async () => {
    const comment = new Comment({});
    let validationError;
    try {
      await comment.validate();
    } catch (err) {
      validationError = err;
    }

    expect(validationError).toBeDefined();
    expect(validationError.errors.listingId).toBeDefined();
    expect(validationError.errors.authorId).toBeDefined();
    expect(validationError.errors.rating).toBeDefined();
    expect(validationError.errors.text).toBeDefined();
  });

  it("fails validation when rating is out of bounds (1 to 5)", async () => {
    const lowRatingComment = new Comment({
      listingId: new mongoose.Types.ObjectId(),
      authorId: new mongoose.Types.ObjectId(),
      rating: 0,
      text: "Too low rating",
    });
    let lowErr;
    try {
      await lowRatingComment.validate();
    } catch (err) {
      lowErr = err;
    }
    expect(lowErr).toBeDefined();
    expect(lowErr.errors.rating).toBeDefined();

    const highRatingComment = new Comment({
      listingId: new mongoose.Types.ObjectId(),
      authorId: new mongoose.Types.ObjectId(),
      rating: 6,
      text: "Too high rating",
    });
    let highErr;
    try {
      await highRatingComment.validate();
    } catch (err) {
      highErr = err;
    }
    expect(highErr).toBeDefined();
    expect(highErr.errors.rating).toBeDefined();
  });

  it("fails validation when text exceeds 1000 characters", async () => {
    const longText = "a".repeat(1001);
    const comment = new Comment({
      listingId: new mongoose.Types.ObjectId(),
      authorId: new mongoose.Types.ObjectId(),
      rating: 4,
      text: longText,
    });

    let validationError;
    try {
      await comment.validate();
    } catch (err) {
      validationError = err;
    }
    expect(validationError).toBeDefined();
    expect(validationError.errors.text).toBeDefined();
  });

  it("defines unique compound index on listingId and authorId", () => {
    const indexes = Comment.schema.indexes();
    const hasUniqueCompoundIndex = indexes.some(([fields, options]) => {
      return (
        fields.listingId === 1 &&
        fields.authorId === 1 &&
        options &&
        options.unique === true
      );
    });

    expect(hasUniqueCompoundIndex).toBe(true);
  });
});
