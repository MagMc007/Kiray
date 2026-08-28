import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { logAuditAction } from "../utils/auditLogger.js";
import { removeListingImage } from "./listingImageService.js";

// In-memory system configuration state
let systemConfigState = {
  maintenanceMode: false,
  allowNewSignups: true,
  maxListingsPerLandlord: 50,
  lastUpdated: new Date(),
};

/**
 * Get detailed system health diagnostics
 */
export const getSystemHealth = async () => {
  const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || "unknown";
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    status: dbStatus === "connected" ? "healthy" : "unhealthy",
    timestamp: new Date(),
    uptimeSeconds: Math.floor(uptime),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || "kiray",
    },
    system: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      memoryUsage: {
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    },
  };
};

/**
 * Get current system configuration settings
 */
export const getSystemConfig = async () => {
  return systemConfigState;
};

/**
 * Update system configuration settings
 */
export const updateSystemConfig = async (
  adminUser,
  newConfig,
  ipAddress = null
) => {
  systemConfigState = {
    ...systemConfigState,
    ...newConfig,
    lastUpdated: new Date(),
  };

  await logAuditAction({
    adminId: adminUser._id,
    action: "SYSTEM_CONFIG_UPDATE",
    targetType: "SystemConfig",
    targetId: adminUser._id,
    metadata: { newConfig: systemConfigState },
    ipAddress,
  });

  return systemConfigState;
};

/**
 * Purge soft-deleted records older than specified threshold
 */
export const purgeSoftDeleted = async (
  adminUser,
  daysOld = 30,
  target = "all",
  ipAddress = null
) => {
  const days = Math.max(1, parseInt(daysOld, 10) || 30);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  let purgedListingsCount = 0;
  let purgedUsersCount = 0;

  if (target === "listings" || target === "all") {
    const expiredListings = await Listing.find({
      isDeleted: true,
      deletedAt: { $lte: cutoffDate },
    });

    for (const listing of expiredListings) {
      if (Array.isArray(listing.images) && listing.images.length > 0) {
        await Promise.allSettled(
          listing.images.map((img) =>
            img.publicId ? removeListingImage(img.publicId) : Promise.resolve()
          )
        );
      }
      await Listing.deleteOne({ _id: listing._id });
      purgedListingsCount++;
    }
  }

  if (target === "users" || target === "all") {
    const userRes = await User.deleteMany({
      isDeleted: true,
      deletedAt: { $lte: cutoffDate },
    });
    purgedUsersCount = userRes.deletedCount || 0;
  }

  await logAuditAction({
    adminId: adminUser._id,
    action: "SYSTEM_PURGE_SOFT_DELETED",
    targetType: "SystemMaintenance",
    targetId: adminUser._id,
    metadata: {
      daysOld: days,
      target,
      cutoffDate,
      purgedListings: purgedListingsCount,
      purgedUsers: purgedUsersCount,
    },
    ipAddress,
  });

  return {
    cutoffDate,
    purgedListings: purgedListingsCount,
    purgedUsers: purgedUsersCount,
  };
};
