import cloudinary from "cloudinary";

// Mock cloudinary
jest.mock("cloudinary");

// Mock logger to avoid console output during tests
jest.mock("../src/config/logger.js", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("Cloudinary Config", () => {
  beforeEach(() => {
    // Clear all env vars before each test
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    jest.clearAllMocks();
    // Clear the require cache to reimport the module fresh
    jest.resetModules();
  });

  it("should configure Cloudinary with valid env vars", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-api-key";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret";

    cloudinary.v2 = {
      config: jest.fn(),
    };

    // Dynamic import to use the new env vars
    const cloudinaryConfig = await import("../src/config/cloudinary.js");

    expect(cloudinary.v2.config).toHaveBeenCalledWith({
      cloud_name: "test-cloud",
      api_key: "test-api-key",
      api_secret: "test-api-secret",
    });
  });

  it("should throw error when CLOUDINARY_CLOUD_NAME is missing", async () => {
    process.env.CLOUDINARY_API_KEY = "test-api-key";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret";
    delete process.env.CLOUDINARY_CLOUD_NAME;

    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_CLOUD_NAME",
    );
  });

  it("should throw error when CLOUDINARY_API_KEY is missing", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret";
    delete process.env.CLOUDINARY_API_KEY;

    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_API_KEY",
    );
  });

  it("should throw error when CLOUDINARY_API_SECRET is missing", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-api-key";
    delete process.env.CLOUDINARY_API_SECRET;

    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_API_SECRET",
    );
  });

  it("should throw error when multiple env vars are missing", async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    await expect(async () => {
      await import("../src/config/cloudinary.js");
    }).rejects.toThrow(
      "Missing required Cloudinary env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
  });
});
