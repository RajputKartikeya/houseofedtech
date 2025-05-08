import mongoose, { Schema, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minLength: [2, "Category name must be at least 2 characters long"],
      maxLength: [30, "Category name cannot exceed 30 characters"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  { timestamps: true }
);

// Ensure uniqueness of category names per user
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

// Prevent model recreation during development hot reloads
const Category = models.Category || mongoose.model("Category", categorySchema);

export default Category;
