"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connect";
import User from "@/models/user.model";
import { revalidatePath } from "next/cache";

// Input validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    console.log("Registration request received");
    console.log("Request data:", { ...data, password: "[REDACTED]" });

    // Validate input
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      console.log("Validation failed:", result.error.flatten());
      throw new Error(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.flatten(),
        })
      );
    }

    const { name, email, password } = result.data;

    // Connect to database
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected successfully");

    // Check if user already exists
    console.log(`Checking if user exists with email: ${email}`);
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      console.log("User already exists");
      throw new Error("Email already registered");
    }

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("Password hashed successfully");

    // Create new user
    console.log("Creating new user...");
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("User created successfully:", {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    // Convert _id to string and remove password
    const user = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    revalidatePath("/login");

    return {
      message: "User registered successfully",
      user,
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Registration failed"
    );
  }
}
