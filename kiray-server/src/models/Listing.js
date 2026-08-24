import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "ETB" },

    propertyType: {
      type: String,
      enum: ["apartment", "house", "studio", "room", "villa", "condo", "other"],
      required: true,
    },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    area: { type: Number, min: 0 },
    areaUnit: { type: String, enum: ["sqm", "sqft"], default: "sqm" },

    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "parking",
          "ac",
          "heating",
          "furnished",
          "unfurnished",
          "washer",
          "dryer",
          "balcony",
          "garden",
          "pool",
          "gym",
          "pet_friendly",
          "security",
          "elevator",
          "water_included",
          "electricity_included",
          "gas_included",
        ],
      },
    ],

    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      neighborhood: { type: String },
      postalCode: { type: String },
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],

    status: {
      type: String,
      enum: ["open", "rented", "unavailable"],
      default: "open",
      index: true,
    },
    availableFrom: { type: Date, default: null },
    availableUntil: { type: Date, default: null },

    viewCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    contactClickCount: { type: Number, default: 0 },

    averageRating: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },

    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: null },
    flagCount: { type: Number, default: 0 },
    deactivationReason: { type: String, default: null },
    deactivationMessage: { type: String, default: null },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

listingSchema.index({ location: "2dsphere" });
listingSchema.index({ status: 1, price: 1, bedrooms: 1, propertyType: 1 });
listingSchema.index({
  title: "text",
  description: "text",
  "address.city": "text",
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
