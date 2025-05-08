import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Category from "@/models/category.model";
import Task from "@/models/task.model";

// Category update validation schema
const categoryUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(30, "Category name cannot exceed 30 characters")
    .trim(),
});

// GET - fetch a single category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await dbConnect();

    const category = await Category.findById(id).exec();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Verify that the category belongs to the user
    if (category.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Format response
    const formattedCategory = {
      id: category._id.toString(),
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PATCH - update a category
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate update data
    const result = categoryUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name } = result.data;

    await dbConnect();

    // First check if the category exists and belongs to the user
    const existingCategory = await Category.findById(id).exec();

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existingCategory.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if another category with same name already exists for this user
    const duplicateCategory = await Category.findOne({
      name,
      userId: session.user.id,
      _id: { $ne: id },
    }).exec();

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: { name } },
      { new: true, runValidators: true }
    ).exec();

    // Format response
    const formattedCategory = {
      id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    };

    return NextResponse.json({
      message: "Category updated successfully",
      category: formattedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - delete a category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await dbConnect();

    // First check if the category exists and belongs to the user
    const existingCategory = await Category.findById(id).exec();

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existingCategory.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if any tasks are using this category
    const tasksWithCategory = await Task.countDocuments({
      categoryId: id,
    }).exec();

    // Option 1: Prevent deletion if tasks are using the category
    if (tasksWithCategory > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category",
          message: `This category is used by ${tasksWithCategory} tasks. Please reassign or delete these tasks first.`,
        },
        { status: 400 }
      );
    }

    // Option 2 (alternative): Remove category from tasks
    // await Task.updateMany(
    //   { categoryId: id },
    //   { $unset: { categoryId: "" } }
    // ).exec();

    // Delete the category
    await Category.findByIdAndDelete(id).exec();

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
