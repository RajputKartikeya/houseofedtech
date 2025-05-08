import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Task from "@/models/task.model";
import { TaskPriority, TaskStatus } from "@/types";

// Task creation validation schema
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

// GET tasks with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;

    // Query parameters for filtering
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    // Query parameters for pagination and sorting
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build query filters
    const queryFilter: any = { userId: session.user.id };

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

    // Format response
    const formattedTasks = tasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.categoryId
        ? {
            id: task.categoryId._id,
            name: task.categoryId.name,
          }
        : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    return NextResponse.json({
      tasks: formattedTasks,
      pagination: {
        total: totalTasks,
        page,
        limit,
        totalPages: Math.ceil(totalTasks / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - create a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate task data
    const result = taskCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
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

    return NextResponse.json(
      {
        message: "Task created successfully",
        task: {
          id: newTask._id.toString(),
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          categoryId: newTask.categoryId?.toString(),
          createdAt: newTask.createdAt,
          updatedAt: newTask.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
