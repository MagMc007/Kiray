import cloudinary from "../config/cloudinary.js";

const UPLOAD_FOLDER = "kiray/listings";
const IMAGE_TRANSFORMATION = [{ width: 1200, height: 800, crop: "limit" }];

const uploadToCloudinary = (file, index) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        resource_type: "image",
        transformation: IMAGE_TRANSFORMATION,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          order: index,
        });
      },
    );

    stream.end(file.buffer);
  });
};

export const uploadListingImages = async (files) => {
  if (!Array.isArray(files)) {
    return [];
  }

  return await Promise.all(
    files.map((file, index) => uploadToCloudinary(file, index)),
  );
};

export const removeListingImage = async (publicId) => {
  if (!publicId) {
    throw new Error("publicId is required");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Failed to delete image: ${result.result}`);
  }

  return result;
};
