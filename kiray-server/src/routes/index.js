import { Router } from "express";
import authRoutes from "./v1/authRoutes.js";
import userRoutes from "./v1/userRoutes.js";
import listingRoutes from "./v1/listingRoutes.js";
import commentRoutes from "./v1/commentRoutes.js";
import adminRoutes from "./v1/adminRoutes.js";
import { authLimiter } from "../middleware/rateLimiters.js";

const apiV1Router = Router();

// Mount route modules
apiV1Router.use("/auth", authLimiter, authRoutes);
apiV1Router.use("/users", userRoutes);
apiV1Router.use("/listings", listingRoutes);
apiV1Router.use("/listings/:id/comments", commentRoutes);
apiV1Router.use("/admin", adminRoutes);

export default apiV1Router;
