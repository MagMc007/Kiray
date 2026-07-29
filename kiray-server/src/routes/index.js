import { Router } from "express";
import authRoutes from "./v1/authRoutes.js";

const apiV1Router = Router();

// Mount route modules
apiV1Router.use("/auth", authRoutes);

// Future routes will be mounted here
// - /users
// - /listings
// - /comments
// - /favorites

export default apiV1Router;
