import { Router } from "express";
import authRoutes from "./v1/authRoutes.js";
import userRoutes from "./v1/userRoutes.js";

const apiV1Router = Router();

// Mount route modules
apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/users", userRoutes);

// Future routes will be mounted here
// - /listings
// - /comments
// - /favorites

export default apiV1Router;
