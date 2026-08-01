import User from "../models/User.js";
import { NotFoundError } from "../utils/errors/index.js";

const publicProfileFields = [
  "_id",
  "displayName",
  "fullName",
  "role",
  "photoURL",
  "bio",
  "socials",
  "responseTime",
  "totalListings",
  "activeListings",
  "profileCompleted",
  "createdAt",
  "updatedAt",
];

export const getPublicProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new NotFoundError("User not found");
  }

  const profile = {};
  publicProfileFields.forEach((field) => {
    if (user[field] !== undefined) {
      profile[field] = user[field];
    }
  });

  return profile;
};

// include getUserListingsByID

export const updateOwnProfile = async (firebaseUid, updateData) => {
  const user = await User.findOne({ firebaseUid, isDeleted: false });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const allowedFields = [
    "displayName",
    "fullName",
    "bio",
    "photoURL",
    "role",
    "profileCompleted",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  await user.save();
  return user;
};

export const updateOwnContactInfo = async (firebaseUid, updateData) => {
  const user = await User.findOne({ firebaseUid, isDeleted: false });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (updateData.phoneNumber !== undefined) {
    user.phoneNumber = updateData.phoneNumber;
  }
  if (updateData.email !== undefined) {
    user.email = updateData.email;
  }
  if (updateData.whatsapp !== undefined) {
    user.whatsapp = updateData.whatsapp;
  }

  await user.save();
  return user;
};

export const deleteOwnAccount = async (firebaseUid) => {
  const user = await User.findOne({ firebaseUid, isDeleted: false });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();
  return user;
};
