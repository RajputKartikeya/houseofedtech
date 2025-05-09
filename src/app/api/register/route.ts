import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import dbConnect from "@/lib/db/connect";
import User from "@/models/user.model";

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

export async function POST(req: Request) {
  try {
    console.log("Registration request received");
    const body = await req.json();
    console.log("Request body:", { ...body, password: "[REDACTED]" });

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      console.log("Validation failed:", result.error.flatten());
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
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
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
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

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
