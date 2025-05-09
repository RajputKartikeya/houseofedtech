import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  throw new Error("Please define the MONGODB_URI environment variable");
}

console.log("MongoDB URI found in environment variables");

// Define types for the global cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Initialize the global cache
const globalCache = global as unknown as {
  mongoose: MongooseCache;
};

// Initialize cache if not already set
if (!globalCache.mongoose) {
  globalCache.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const cached = globalCache.mongoose;

  if (cached.conn) {
    console.log("Using cached database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Connecting to database...");
    const opts = {
      bufferCommands: false,
    };

    // Create models in this file to ensure they're registered in the correct order
    const createModels = (mongoose: typeof import("mongoose")) => {
      try {
        // Define schemas directly here to ensure correct registration order
        const userSchema = new mongoose.Schema(
          {
            name: String,
            email: String,
            password: String,
            role: String,
            image: String,
          },
          { timestamps: true }
        );

        // Create User model first
        const User = mongoose.models.User || mongoose.model("User", userSchema);

        // Then Category model
        const categorySchema = new mongoose.Schema(
          {
            name: {
              type: String,
              required: [true, "Category name is required"],
              trim: true,
              minLength: [2, "Category name must be at least 2 characters"],
              maxLength: [30, "Category name cannot exceed 30 characters"],
            },
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: [true, "User ID is required"],
            },
          },
          { timestamps: true }
        );

        categorySchema.index({ name: 1, userId: 1 }, { unique: true });
        const Category =
          mongoose.models.Category ||
          mongoose.model("Category", categorySchema);

        // Finally Task model
        const taskSchema = new mongoose.Schema(
          {
            title: String,
            description: String,
            status: String,
            priority: String,
            dueDate: Date,
            categoryId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Category",
            },
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: [true, "User ID is required"],
            },
          },
          { timestamps: true }
        );

        const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

        console.log("Models registered successfully:", {
          User: !!User,
          Category: !!Category,
          Task: !!Task,
        });

        return mongoose;
      } catch (error) {
        console.error("Error registering models:", error);
        return mongoose;
      }
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(createModels)
      .then((mongoose) => {
        console.log("Connected to database successfully");
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("Database connection error:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
