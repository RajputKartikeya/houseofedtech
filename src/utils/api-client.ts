/**
 * A utility for making API requests with proper error handling
 */

import { TaskPriority, TaskStatus } from "@/types";

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
  category?: { id: string; name: string };
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
    const url = params ? `/api/tasks?${params.toString()}` : "/api/tasks";
    return fetchApi(url);
  },

  async getTask(id: string): Promise<Task> {
    return fetchApi(`/api/tasks/${id}`);
  },

  async createTask(
    data: TaskCreateData
  ): Promise<{ message: string; task: Task }> {
    return fetchApi("/api/tasks", {
      method: "POST",
      body: data,
    });
  },

  async updateTask(
    id: string,
    data: TaskCreateData
  ): Promise<{ message: string; task: Task }> {
    return fetchApi(`/api/tasks/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    return fetchApi(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return fetchApi("/api/categories");
  },

  async createCategory(
    data: CategoryData
  ): Promise<{ message: string; category: Category }> {
    return fetchApi("/api/categories", {
      method: "POST",
      body: data,
    });
  },

  async updateCategory(
    id: string,
    data: CategoryData
  ): Promise<{ message: string; category: Category }> {
    return fetchApi(`/api/categories/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    return fetchApi(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },

  // User registration
  async register(data: UserRegisterData): Promise<{ message: string }> {
    return fetchApi("/api/register", {
      method: "POST",
      body: data,
    });
  },
};
