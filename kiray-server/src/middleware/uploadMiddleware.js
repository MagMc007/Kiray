import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const MAX_FILES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const uploadToCloudinary = (file, index) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "kiray/listings",
        resource_type: "image",
        transformation: [{ width: 1200, height: 800, crop: "limit" }],
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

const uploadImages = async (req, res, next) => {
  const files = req.files || req.__files || [];

  // Backstop checks (multer also enforces these upstream)
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
      files.map((file, index) => uploadToCloudinary(file, index)),
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

export { upload, uploadImages };
export default uploadImages;
