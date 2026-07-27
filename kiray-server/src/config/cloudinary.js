import cloudinary from 'cloudinary';
import logger from './logger.js';

try {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missingVars = [];
    if (!cloudName) missingVars.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missingVars.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingVars.push('CLOUDINARY_API_SECRET');

    throw new Error(
      `Missing required Cloudinary env vars: ${missingVars.join(', ')}. Please add them to your .env file.`
    );
  }

  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  logger.info('Cloudinary configured successfully');
} catch (error) {
  logger.error({ err: error }, 'Failed to configure Cloudinary');
  throw error; // Re-throw to prevent app from starting with incomplete config
}

export default cloudinary.v2;
