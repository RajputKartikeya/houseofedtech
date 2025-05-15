"use server";

import { z } from "zod";
import { getSession } from "@/lib/get-session";
import dbConnect from "@/lib/db/connect";
import Category from "@/models/category.model";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils/serialize";

// Category validation schema
const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(30, "Category name cannot exceed 30 characters")
    .trim(),
});

// Get all categories for the current user
export async function getCategories() {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const categories = await Category.find({ userId: session.user.id })
      .sort({ name: 1 })
      .exec();

    // Format response and serialize
    return serializeData(
      categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch categories"
    );
  }
}

// Get a single category by ID
export async function getCategoryById(id: string) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const category = await Category.findOne({
      _id: id,
      userId: session.user.id,
    }).exec();

    if (!category) {
      throw new Error("Category not found");
    }

    // Serialize response
    return serializeData({
      id: category._id.toString(),
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch category"
    );
  }
}

// Create a new category
export async function createCategory(
  data: z.infer<typeof categoryCreateSchema>
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Validate category data
    const result = categoryCreateSchema.safeParse(data);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    const { name } = result.data;

    await dbConnect();

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      name,
      userId: session.user.id,
    }).exec();

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    // Create the category
    const newCategory = await Category.create({
      name,
      userId: session.user.id,
    });

    revalidatePath("/dashboard/categories");

    // Serialize response
    return serializeData({
      id: newCategory._id.toString(),
      name: newCategory.name,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create category"
    );
  }
}

// Update a category
export async function updateCategory(
  id: string,
  data: z.infer<typeof categoryCreateSchema>
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Validate update data
    const result = categoryCreateSchema.safeParse(data);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    const { name } = result.data;

    await dbConnect();

    // Check if category with same name already exists for this user (excluding current category)
    const existingCategory = await Category.findOne({
      _id: { $ne: id },
      name,
      userId: session.user.id,
    }).exec();

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { name },
      { new: true }
    ).exec();

    if (!updatedCategory) {
      throw new Error("Category not found");
    }

    revalidatePath("/dashboard/categories");

    // Serialize response
    return serializeData({
      id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update category"
    );
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const deletedCategory = await Category.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).exec();

    if (!deletedCategory) {
      throw new Error("Category not found");
    }

    revalidatePath("/dashboard/categories");

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete category"
    );
  }
}
