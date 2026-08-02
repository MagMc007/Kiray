import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ["landlord", "rentee", "admin"],
      required: true,
    },

    displayName: { type: String, required: true, trim: true, maxlength: 50 },
    fullName: { type: String, trim: true, default: null },
    phoneNumber: { type: [String], default: [] },
    profileCompleted: { type: Boolean, default: false },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    photoURL: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: "" },

    socials: {
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
    },

    responseTime: { type: Number, default: null },
    totalListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds & maintains createdAt / updatedAt automatically
  },
);

userSchema.index({ displayName: "text" });

const User = mongoose.model("User", userSchema);

export default User;
