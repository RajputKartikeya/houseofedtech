/**
 * A utility for making API requests with proper error handling
 */

import { TaskPriority, TaskStatus } from "@/types";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTaskById,
} from "@/lib/actions/task.actions";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category.actions";
import { registerUser } from "@/lib/actions/auth.actions";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(status: number, message: string, data?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * Make an API request with proper error handling
 */
export async function fetchApi<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, ...customOptions } = options;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  // Set up fetch options
  const fetchOptions: RequestInit = {
    ...customOptions,
    headers,
  };

  // Add body if provided
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  // Make the request
  const response = await fetch(url, fetchOptions);

  // Parse the response
  let data;
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle errors
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || data?.message || response.statusText,
      data
    );
  }

  return data as T;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | Date;
  category?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskCreateData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  categoryId?: string | null;
}

interface CategoryData {
  name: string;
}

interface UserRegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * API client methods
 */
export const apiClient = {
  // Tasks
  async getTasks(params?: URLSearchParams): Promise<TasksResponse> {
    try {
      // Extract parameters from URLSearchParams
      const status = params?.get("status") || "";
      const priority = params?.get("priority") || "";
      const categoryId = params?.get("categoryId") || "";
      const search = params?.get("search") || "";
      const page = parseInt(params?.get("page") || "1", 10);
      const limit = parseInt(params?.get("limit") || "10", 10);
      const sortBy = params?.get("sortBy") || "createdAt";
      const sortOrder = (params?.get("sortOrder") || "desc") as "asc" | "desc";

      const result = await getTasks({
        status,
        priority,
        categoryId,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      return result as TasksResponse;
    } catch (error) {
      console.error("Error in getTasks client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to fetch tasks"
      );
    }
  },

  async getTask(id: string): Promise<Task> {
    try {
      const task = await getTaskById(id);
      return task as unknown as Task;
    } catch (error) {
      console.error("Error in getTask client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to fetch task"
      );
    }
  },

  async createTask(
    data: TaskCreateData
  ): Promise<{ message: string; task: Task }> {
    try {
      const createData = {
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.TODO,
        priority: data.priority || TaskPriority.MEDIUM,
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        categoryId: data.categoryId,
      };

      const task = await createTask(createData);

      return {
        message: "Task created successfully",
        task: task as unknown as Task,
      };
    } catch (error) {
      console.error("Error in createTask client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to create task"
      );
    }
  },

  async updateTask(
    id: string,
    data: TaskCreateData
  ): Promise<{ message: string; task: Task }> {
    try {
      const updatedData: Record<string, unknown> = {};

      if (data.title !== undefined) updatedData.title = data.title;
      if (data.description !== undefined)
        updatedData.description = data.description;
      if (data.status !== undefined) updatedData.status = data.status;
      if (data.priority !== undefined) updatedData.priority = data.priority;
      if (data.categoryId !== undefined)
        updatedData.categoryId = data.categoryId;
      if (data.dueDate !== undefined) {
        updatedData.dueDate = data.dueDate ? data.dueDate.toISOString() : null;
      }

      const task = await updateTask(id, updatedData);

      return {
        message: "Task updated successfully",
        task: task as unknown as Task,
      };
    } catch (error) {
      console.error("Error in updateTask client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to update task"
      );
    }
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    try {
      await deleteTask(id);
      return { message: "Task deleted successfully" };
    } catch (error) {
      console.error("Error in deleteTask client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to delete task"
      );
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const categories = await getCategories();
      return categories as Category[];
    } catch (error) {
      console.error("Error in getCategories client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
    }
  },

  async createCategory(
    data: CategoryData
  ): Promise<{ message: string; category: Category }> {
    try {
      const category = await createCategory(data);

      return {
        message: "Category created successfully",
        category: category as Category,
      };
    } catch (error) {
      console.error("Error in createCategory client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  },

  async updateCategory(
    id: string,
    data: CategoryData
  ): Promise<{ message: string; category: Category }> {
    try {
      const category = await updateCategory(id, data);

      return {
        message: "Category updated successfully",
        category: category as Category,
      };
    } catch (error) {
      console.error("Error in updateCategory client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to update category"
      );
    }
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      await deleteCategory(id);
      return { message: "Category deleted successfully" };
    } catch (error) {
      console.error("Error in deleteCategory client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  },

  // User registration
  async register(data: UserRegisterData): Promise<{ message: string }> {
    try {
      const result = await registerUser(data);
      return { message: result.message };
    } catch (error) {
      console.error("Error in register client:", error);
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Failed to register user"
      );
    }
  },
};
