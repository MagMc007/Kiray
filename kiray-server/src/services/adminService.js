import { initializeFirebaseAdmin } from "../config/firebase.js";
import User from "../models/User.js";

export const bootstrapAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || "Kiray Admin";

  if (!adminEmail || !adminPassword) {
    return null;
  }

  const admin = await initializeFirebaseAdmin();
  const auth = admin.auth();

  try {
    await auth.getUserByEmail(adminEmail);
    return null;
  } catch (error) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }
  }

  const firebaseUser = await auth.createUser({
    email: adminEmail,
    password: adminPassword,
    displayName: adminDisplayName,
    emailVerified: true,
  });

  const existingUser = await User.findOne({ firebaseUid: firebaseUser.uid });
  if (existingUser) {
    return existingUser;
  }

  return User.create({
    firebaseUid: firebaseUser.uid,
    role: "admin",
    displayName: adminDisplayName,
    email: adminEmail,
    profileCompleted: true,
  });
};
