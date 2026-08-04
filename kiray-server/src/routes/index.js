import { Router } from "express";
import authRoutes from "./v1/authRoutes.js";
import userRoutes from "./v1/userRoutes.js";
import listingRoutes from "./v1/listingRoutes.js";

const apiV1Router = Router();

// Mount route modules
apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/users", userRoutes);
apiV1Router.use("/listings", listingRoutes);

// Future routes will be mounted here
// - /comments
// - /favorites

export default apiV1Router;
