import mongoose, { Schema, models } from "mongoose";
import { TaskStatus, TaskPriority } from "@/types";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minLength: [3, "Task title must be at least 3 characters long"],
      maxLength: [100, "Task title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  { timestamps: true }
);

// Create indexes for frequent queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, categoryId: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

// Prevent model recreation during development hot reloads
const Task = models.Task || mongoose.model("Task", taskSchema);

export default Task;
