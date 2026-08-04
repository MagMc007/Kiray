import multer from "multer";
import cloudinary from "cloudinary";

const MAX_FILES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
});

const uploadImages = async (req, res, next) => {
  const files = req.__files || req.files || [];

  if (files.length > MAX_FILES) {
    return res.status(400).json({
      success: false,
      error: `You can upload up to ${MAX_FILES} images per listing.`,
    });
  }

  if (files.some((file) => file.size > MAX_FILE_SIZE)) {
    return res.status(413).json({
      success: false,
      error: `Each image must be 5MB or smaller.`,
    });
  }

  try {
    const uploadedFiles = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            {
              folder: "kiray/listings",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                originalName: file.originalname,
              });
            },
          );

          stream.end(file.buffer);
        });
      }),
    );

    req.files = uploadedFiles;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Image upload failed",
    });
  }
};

export { uploadImages };
export default uploadImages;
