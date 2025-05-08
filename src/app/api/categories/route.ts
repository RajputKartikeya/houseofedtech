import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Category from "@/models/category.model";

// Category creation validation schema
const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(30, "Category name cannot exceed 30 characters")
    .trim(),
});

// GET - fetch all categories for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const categories = await Category.find({ userId: session.user.id })
      .sort({ name: 1 })
      .exec();

    // Format response
    const formattedCategories = categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - create a new category
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate category data
    const result = categoryCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name } = result.data;

    await dbConnect();

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      name,
      userId: session.user.id,
    }).exec();

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Create the category
    const newCategory = await Category.create({
      name,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: {
          id: newCategory._id.toString(),
          name: newCategory.name,
          createdAt: newCategory.createdAt,
          updatedAt: newCategory.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
