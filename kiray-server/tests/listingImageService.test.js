import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const uploadStreamMock = jest.fn();
const destroyMock = jest.fn();

jest.unstable_mockModule("../src/config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: uploadStreamMock,
      destroy: destroyMock,
    },
  },
}));

const { uploadListingImages, removeListingImage } =
  await import("../src/services/listingImageService.js");

describe("listingImageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads files and returns Cloudinary metadata", async () => {
    uploadStreamMock.mockImplementation((options, callback) => {
      callback(null, {
        secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        public_id: "kiray/listings/sample",
      });
      return { end: jest.fn() };
    });

    const files = [
      {
        buffer: Buffer.from("image"),
        originalname: "sample.jpg",
        mimetype: "image/jpeg",
        size: 1024,
      },
    ];

    const result = await uploadListingImages(files);

    expect(result).toEqual([
      expect.objectContaining({
        url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        publicId: "kiray/listings/sample",
        originalName: "sample.jpg",
        order: 0,
      }),
    ]);
  });

  it("removes an image by publicId", async () => {
    destroyMock.mockResolvedValue({ result: "ok" });

    const result = await removeListingImage("kiray/listings/sample");

    expect(destroyMock).toHaveBeenCalledWith("kiray/listings/sample", {
      resource_type: "image",
    });
    expect(result).toEqual({ result: "ok" });
  });

  it("throws if publicId is missing for removeListingImage", async () => {
    await expect(removeListingImage()).rejects.toThrow("publicId is required");
  });
});
