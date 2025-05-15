"use server";

import { z } from "zod";
import { getSession } from "@/lib/get-session";
import dbConnect from "@/lib/db/connect";
import Task from "@/models/task.model";
import { TaskPriority, TaskStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils/serialize";

// Task validation schemas
const taskCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

// Get tasks with filtering, sorting, and pagination
export async function getTasks({
  status = "",
  priority = "",
  categoryId = "",
  search = "",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  status?: string;
  priority?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const skip = (page - 1) * limit;

    // Build query filters
    const queryFilter: Record<string, unknown> = { userId: session.user.id };

    if (status) {
      queryFilter.status = status;
    }

    if (priority) {
      queryFilter.priority = priority;
    }

    if (categoryId) {
      queryFilter.categoryId = categoryId;
    }

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    await dbConnect();

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(queryFilter).exec();

    // Get sorted tasks with pagination
    const tasks = await Task.find(queryFilter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name")
      .exec();

    // Format and serialize response
    return serializeData({
      tasks: tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        category: task.categoryId
          ? {
              id: task.categoryId._id.toString(),
              name: task.categoryId.name,
            }
          : null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      pagination: {
        total: totalTasks,
        page,
        limit,
        totalPages: Math.ceil(totalTasks / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}

// Get a single task by ID
export async function getTaskById(id: string) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    const task = await Task.findById(id).populate("categoryId", "name").exec();

    if (!task) {
      throw new Error("Task not found");
    }

    // Verify that the task belongs to the user
    if (task.userId.toString() !== session.user.id) {
      throw new Error("Access denied");
    }

    // Format and serialize response
    return serializeData({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.categoryId
        ? {
            id: task.categoryId._id.toString(),
            name: task.categoryId.name,
          }
        : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch task"
    );
  }
}

// Create a new task
export async function createTask(data: z.infer<typeof taskCreateSchema>) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Validate task data
    const result = taskCreateSchema.safeParse(data);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    const { title, description, status, priority, dueDate, categoryId } =
      result.data;

    await dbConnect();

    // Create the task
    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      categoryId: categoryId || undefined,
      userId: session.user.id,
    });

    revalidatePath("/dashboard/tasks");

    // Serialize and return response
    return serializeData({
      id: newTask._id.toString(),
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      categoryId: newTask.categoryId?.toString(),
      createdAt: newTask.createdAt,
      updatedAt: newTask.updatedAt,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create task"
    );
  }
}

// Update a task
export async function updateTask(
  id: string,
  data: Partial<z.infer<typeof taskUpdateSchema>>
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Validate update data - but only for the fields that are provided
    const schemaToValidate = z.object(
      Object.fromEntries(
        Object.entries(taskUpdateSchema.shape).filter(([key]) => key in data)
      )
    );

    const result = schemaToValidate.safeParse(data);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    await dbConnect();

    // First check if the task exists and belongs to the user
    const existingTask = await Task.findById(id).exec();

    if (!existingTask) {
      throw new Error("Task not found");
    }

    if (existingTask.userId.toString() !== session.user.id) {
      throw new Error("Access denied");
    }

    // Prepare update data
    const updateData = { ...data };

    // Convert dueDate string to Date if present
    if ("dueDate" in updateData && updateData.dueDate) {
      // @ts-expect-error - MongoDB expects Date but we're handling string in API
      updateData.dueDate = new Date(updateData.dueDate);
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("categoryId", "name")
      .exec();

    revalidatePath("/dashboard/tasks");

    // Serialize and return response
    return serializeData({
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate,
      category: updatedTask.categoryId
        ? {
            id: updatedTask.categoryId._id.toString(),
            name: updatedTask.categoryId.name,
          }
        : null,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update task"
    );
  }
}

// Delete a task
export async function deleteTask(id: string) {
  try {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    // First check if the task exists and belongs to the user
    const existingTask = await Task.findById(id).exec();

    if (!existingTask) {
      throw new Error("Task not found");
    }

    if (existingTask.userId.toString() !== session.user.id) {
      throw new Error("Access denied");
    }

    // Delete the task
    await Task.findByIdAndDelete(id).exec();

    revalidatePath("/dashboard/tasks");

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete task"
    );
  }
}
