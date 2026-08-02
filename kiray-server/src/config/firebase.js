import logger from "./logger.js";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin SDK will be lazily initialized when first needed

let adminInstance = null;

// Validate Firebase service account configuration on module load
try {
  const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJSON) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT env var is not set. Please add a valid Firebase service account JSON to your .env file.",
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJSON);
  } catch (parseError) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Please ensure it is a properly formatted JSON string.",
    );
  }

  if (
    !serviceAccount.project_id ||
    !serviceAccount.private_key ||
    !serviceAccount.client_email
  ) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is missing required fields: project_id, private_key, or client_email.",
    );
  }

  logger.info("Firebase Admin SDK configuration validated successfully");
} catch (error) {
  logger.error({ err: error }, "Failed to validate Firebase configuration");
  throw error;
}

// Lazy initialization function to be called when admin SDK is actually needed
export async function initializeFirebaseAdmin() {
  if (adminInstance) {
    return adminInstance;
  }

  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }

    adminInstance = {
      auth: getAuth,
    };

    logger.info("Firebase Admin SDK initialized successfully");

    return adminInstance;
  } catch (error) {
    logger.error({ err: error }, "Failed to initialize Firebase Admin SDK");
    throw error;
  }
}

export default {
  initializeFirebaseAdmin,
};
