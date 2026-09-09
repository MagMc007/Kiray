import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    verifiedRentee: {
      type: Boolean,
      default: false,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ listingId: 1, authorId: 1 }, { unique: true });
commentSchema.index({ listingId: 1, isDeleted: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
