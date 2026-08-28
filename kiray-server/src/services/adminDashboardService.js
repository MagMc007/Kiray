import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";

/**
 * Get high-level system dashboard overview metrics
 */
export const getDashboardOverview = async () => {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    bannedUsers,
    landlordUsers,
    renteeUsers,
    adminUsers,
    totalListings,
    activeListings,
    flaggedListings,
    pendingReports,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ status: "active", isDeleted: false }),
    User.countDocuments({ status: "suspended", isDeleted: false }),
    User.countDocuments({ status: "banned", isDeleted: false }),
    User.countDocuments({ role: "landlord", isDeleted: false }),
    User.countDocuments({ role: "rentee", isDeleted: false }),
    User.countDocuments({ role: "admin", isDeleted: false }),
    Listing.countDocuments({ isDeleted: false }),
    Listing.countDocuments({ status: "open", isDeleted: false }),
    Listing.countDocuments({ isFlagged: true, isDeleted: false }),
    Report.countDocuments({ status: "pending" }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      banned: bannedUsers,
      byRole: {
        landlord: landlordUsers,
        rentee: renteeUsers,
        admin: adminUsers,
      },
    },
    listings: {
      total: totalListings,
      active: activeListings,
      flagged: flaggedListings,
    },
    reports: {
      pending: pendingReports,
    },
  };
};

/**
 * Get timeseries metrics for user signups and listing creations
 * 
 * @param {Object} query
 * @param {string} [query.period="30d"] - '7d' | '30d' | '90d' | '1y'
 */
export const getActivityAnalytics = async ({ period = "30d" } = {}) => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "30d":
    default:
      startDate.setDate(now.getDate() - 30);
      break;
  }

  const [userSignups, listingCreations] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate }, isDeleted: false } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Listing.aggregate([
      { $match: { createdAt: { $gte: startDate }, isDeleted: false } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    period,
    startDate,
    endDate: now,
    userSignups: userSignups.map((item) => ({ date: item._id, count: item.count })),
    listingCreations: listingCreations.map((item) => ({ date: item._id, count: item.count })),
  };
};
