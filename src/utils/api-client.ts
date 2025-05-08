/**
 * A utility for making API requests with proper error handling
 */

type FetchOptions = RequestInit & {
  body?: any;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * Make an API request with proper error handling
 */
export async function fetchApi<T = any>(
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
  if (body) {
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

/**
 * API client methods
 */
export const apiClient = {
  // Tasks
  async getTasks(params?: URLSearchParams): Promise<any> {
    const url = params ? `/api/tasks?${params.toString()}` : "/api/tasks";
    return fetchApi(url);
  },

  async getTask(id: string): Promise<any> {
    return fetchApi(`/api/tasks/${id}`);
  },

  async createTask(data: any): Promise<any> {
    return fetchApi("/api/tasks", {
      method: "POST",
      body: data,
    });
  },

  async updateTask(id: string, data: any): Promise<any> {
    return fetchApi(`/api/tasks/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async deleteTask(id: string): Promise<any> {
    return fetchApi(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },

  // Categories
  async getCategories(): Promise<any> {
    return fetchApi("/api/categories");
  },

  async createCategory(data: any): Promise<any> {
    return fetchApi("/api/categories", {
      method: "POST",
      body: data,
    });
  },

  async updateCategory(id: string, data: any): Promise<any> {
    return fetchApi(`/api/categories/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async deleteCategory(id: string): Promise<any> {
    return fetchApi(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },

  // User registration
  async register(data: any): Promise<any> {
    return fetchApi("/api/register", {
      method: "POST",
      body: data,
    });
  },
};
