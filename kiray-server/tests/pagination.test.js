import { describe, it, expect } from "@jest/globals";
import { buildPagination } from "../src/utils/pagination.js";

describe("buildPagination", () => {
  it("first page of many: hasPrev false, hasNext true", () => {
    const meta = buildPagination(1, 10, 25);
    expect(meta).toEqual({
      page: 1,
      totalPages: 3,
      totalItems: 25,
      hasNext: true,
      hasPrev: false,
    });
  });

  it("last page: hasPrev true, hasNext false", () => {
    const meta = buildPagination(3, 10, 25);
    expect(meta).toEqual({
      page: 3,
      totalPages: 3,
      totalItems: 25,
      hasNext: false,
      hasPrev: true,
    });
  });

  it("middle page: both hasPrev and hasNext true", () => {
    const meta = buildPagination(2, 10, 25);
    expect(meta).toEqual({
      page: 2,
      totalPages: 3,
      totalItems: 25,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("empty results: totalPages and totalItems are 0", () => {
    const meta = buildPagination(1, 20, 0);
    expect(meta).toEqual({
      page: 1,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
    });
  });

  it("single page: all items fit, hasNext and hasPrev are false", () => {
    const meta = buildPagination(1, 20, 15);
    expect(meta).toEqual({
      page: 1,
      totalPages: 1,
      totalItems: 15,
      hasNext: false,
      hasPrev: false,
    });
  });

  it("ceil rounding: 11 items with limit 10 yields 2 pages", () => {
    expect(buildPagination(1, 10, 11).totalPages).toBe(2);
    expect(buildPagination(2, 10, 11).hasNext).toBe(false);
  });

  it("exact multiple: 20 items with limit 10 yields exactly 2 pages", () => {
    expect(buildPagination(1, 10, 20).totalPages).toBe(2);
    expect(buildPagination(2, 10, 20).hasNext).toBe(false);
    expect(buildPagination(1, 10, 20).hasNext).toBe(true);
  });
});
