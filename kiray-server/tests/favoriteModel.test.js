import { describe, it, expect } from "@jest/globals";
import mongoose from "mongoose";
import Favorite from "../src/models/Favorite.js";

describe("Favorite model", () => {
  it("validates required favorite fields", async () => {
    const favorite = new Favorite({
      userId: new mongoose.Types.ObjectId(),
      listingId: new mongoose.Types.ObjectId(),
    });

    let validationError;
    try {
      await favorite.validate();
    } catch (err) {
      validationError = err;
    }

    expect(validationError).toBeUndefined();
    expect(favorite.userId).toBeDefined();
    expect(favorite.listingId).toBeDefined();
  });

  it("fails validation when required fields are missing", async () => {
    const favorite = new Favorite({});
    let validationError;
    try {
      await favorite.validate();
    } catch (err) {
      validationError = err;
    }

    expect(validationError).toBeDefined();
    expect(validationError.errors.userId).toBeDefined();
    expect(validationError.errors.listingId).toBeDefined();
  });

  it("defines unique compound index on userId and listingId", () => {
    const indexes = Favorite.schema.indexes();
    const hasUniqueCompoundIndex = indexes.some(([fields, options]) => {
      return (
        fields.userId === 1 &&
        fields.listingId === 1 &&
        options &&
        options.unique === true
      );
    });

    expect(hasUniqueCompoundIndex).toBe(true);
  });
});
