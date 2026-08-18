import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockConfig = jest.fn();
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

jest.unstable_mockModule("cloudinary", () => ({
  __esModule: true,
  default: {
    v2: {
      config: mockConfig,
    },
  },
}));

jest.unstable_mockModule("../src/config/logger.js", () => ({
  __esModule: true,
  default: mockLogger,
}));

describe("Cloudinary Config", () => {
  beforeEach(() => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    jest.clearAllMocks();
    mockConfig.mockReset();
    jest.resetModules();
  });

  it("should configure Cloudinary with valid env vars", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-api-key";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret";

    await import("../src/config/cloudinary.js");

    expect(mockConfig).toHaveBeenCalledWith({
      cloud_name: "test-cloud",
      api_key: "test-api-key",
      api_secret: "test-api-secret",
    });
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("should throw error when CLOUDINARY_CLOUD_NAME is missing", async () => {
    process.env.CLOUDINARY_API_KEY = "test-api-key";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret";

    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_CLOUD_NAME",
    );
  });

  it("should throw error when CLOUDINARY_API_KEY is missing", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret";

    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_API_KEY",
    );
  });

  it("should throw error when CLOUDINARY_API_SECRET is missing", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-api-key";

    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_API_SECRET",
    );
  });

  it("should throw error when multiple env vars are missing", async () => {
    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
  });
});