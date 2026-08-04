import { jest, beforeEach, describe, it, expect } from "@jest/globals";

const uploadStreamMock = jest.fn();

jest.unstable_mockModule("cloudinary", () => ({
  default: {
    v2: {
      uploader: {
        upload_stream: uploadStreamMock,
      },
    },
  },
}));

const multerMock = jest.fn((options) => ({
  array: jest.fn(() => (req, res, next) => {
    req.files = req.__files || [];
    next();
  }),
}));

multerMock.memoryStorage = jest.fn(() => ({}));

jest.unstable_mockModule("multer", () => ({
  default: multerMock,
}));

const { uploadImages } = await import("../src/middleware/uploadMiddleware.js");

describe("uploadImages middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects more than six files", async () => {
    const req = {
      __files: Array.from({ length: 7 }, (_, index) => ({
        buffer: Buffer.from(`file-${index}`),
        originalname: `image-${index}.png`,
        mimetype: "image/png",
        size: 1024,
      })),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await uploadImages(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining("up to 6") }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects files larger than 5MB", async () => {
    const req = {
      __files: [
        {
          buffer: Buffer.from("image"),
          originalname: "oversized.png",
          mimetype: "image/png",
          size: 6 * 1024 * 1024,
        },
      ],
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await uploadImages(req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.stringContaining("5MB") }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("uploads valid images and attaches Cloudinary URL and publicId", async () => {
    uploadStreamMock.mockImplementation((options, callback) => {
      callback(null, {
        secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        public_id: "kiray/listings/sample",
      });
      return { end: jest.fn() };
    });

    const req = {
      __files: [
        {
          buffer: Buffer.from("image"),
          originalname: "sample.jpg",
          mimetype: "image/jpeg",
          size: 1024,
        },
      ],
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await uploadImages(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.files).toEqual([
      expect.objectContaining({
        url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        publicId: "kiray/listings/sample",
      }),
    ]);
  });
});
