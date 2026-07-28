import { initializeFirebaseAdmin } from "../config/firebase.js";
import User from "../models/User.js";
import { UnauthorizedError, NotFoundError } from "../utils/errors/index.js";

const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split("Bearer ")[1];

    // Lazy initialization of Firebase Admin SDK
    const admin = await initializeFirebaseAdmin();

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (jwtError) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const user = await User.findOne({ firebaseUid: decodedToken.uid, isDeleted: false });
    if (!user) {
      throw new NotFoundError("User not found. Please sync first.");
    }

    req.user = user;
    req.firebaseUid = decodedToken.uid;
    next();
  } catch (error) {
    next(error); // Forwarded to the global error middleware
  }
};

export default verifyAuth;
