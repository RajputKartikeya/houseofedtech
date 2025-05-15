import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TaskStatus, TaskPriority } from "@/types";
import { apiClient } from "@/utils/api-client";
import { toast } from "sonner";

// Define types that match the ones in api-client
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

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TasksResponse {
  tasks: Task[];
  pagination: PaginationState;
}

interface TaskCache {
  [key: string]: {
    data: TasksResponse;
    timestamp: number;
  };
}

interface UseTasksOptions {
  status?: TaskStatus;
  category?: string;
  cacheDuration?: number; // in milliseconds
}

const cache: TaskCache = {};
const CACHE_EXPIRY = 60 * 1000; // 1 minute default cache duration

export function useTasks({
  status,
  category,
  cacheDuration = CACHE_EXPIRY,
}: UseTasksOptions = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isClientSideFiltering, setIsClientSideFiltering] = useState(false);
  const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState(0);

  // Build query parameters for API requests
  const buildQueryParams = useCallback(
    (overrides: Record<string, string> = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      // Set default filters
      if (status) params.set("status", status);
      if (category) params.set("categoryId", category);

      // Apply overrides
      Object.entries(overrides).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      return params;
    },
    [searchParams, status, category]
  );

  // Get the current filter values from URL
  const currentFilters = useMemo(() => {
    const params = searchParams.toString();
    const urlStatus = searchParams.get("status") || status || "";
    const urlPriority = searchParams.get("priority") || "";
    const urlCategoryId = searchParams.get("categoryId") || category || "";
    const urlSearch = searchParams.get("search") || "";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    const urlLimit = parseInt(searchParams.get("limit") || "10", 10);

    return {
      status: urlStatus,
      priority: urlPriority,
      categoryId: urlCategoryId,
      search: urlSearch,
      page: urlPage,
      limit: urlLimit,
      queryString: params,
    };
  }, [searchParams, status, category]);

  // Function to check if data is in cache and valid
  const getFromCache = useCallback(
    (params: URLSearchParams): TasksResponse | null => {
      const cacheKey = params.toString();
      const cachedData = cache[cacheKey];

      if (cachedData && Date.now() - cachedData.timestamp < cacheDuration) {
        return cachedData.data;
      }

      return null;
    },
    [cacheDuration]
  );

  // Apply client-side filtering to tasks
  const applyClientSideFilters = useCallback(() => {
    if (tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }

    const { status, priority, categoryId, search } = currentFilters;

    let filtered = [...tasks];

    // Apply status filter
    if (status) {
      filtered = filtered.filter((task) => task.status === status);
    }

    // Apply priority filter
    if (priority) {
      filtered = filtered.filter((task) => task.priority === priority);
    }

    // Apply category filter
    if (categoryId) {
      filtered = filtered.filter((task) => task.category?.id === categoryId);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description &&
            task.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTasks(filtered);

    // Update pagination for client-side filtering
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
    }));
  }, [tasks, currentFilters]);

  // Fetch tasks based on filters
  const fetchTasks = useCallback(
    async (force = false) => {
      try {
        setIsLoading(true);

        const params = buildQueryParams();
        const page = parseInt(params.get("page") || "1");
        const limit = parseInt(params.get("limit") || "10");
        params.set("page", page.toString());
        params.set("limit", limit.toString());

        // Check if we already have client-side data we can filter
        const shouldUseClientSide = !force && tasks.length > 0;

        if (shouldUseClientSide) {
          setIsClientSideFiltering(true);
          applyClientSideFilters();
          setIsLoading(false);
          return;
        }

        // Check cache before making API request
        const cachedResponse = !force ? getFromCache(params) : null;

        if (cachedResponse) {
          setTasks(cachedResponse.tasks);
          setFilteredTasks(cachedResponse.tasks);
          setPagination(cachedResponse.pagination);
          setIsClientSideFiltering(false);
          setIsLoading(false);
          return;
        }

        // Make API request if data not in cache
        const response = await apiClient.getTasks(params);

        // Store in cache
        cache[params.toString()] = {
          data: response,
          timestamp: Date.now(),
        };

        setTasks(response.tasks as Task[]);
        setFilteredTasks(response.tasks as Task[]);
        setPagination(
          response.pagination || {
            total: response.tasks.length,
            page,
            limit,
            totalPages: Math.ceil(response.tasks.length / limit),
          }
        );
        setIsClientSideFiltering(false);
        setLastRefreshTimestamp(Date.now());
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    },
    [buildQueryParams, getFromCache, tasks.length, applyClientSideFilters]
  );

  // Force refresh tasks from server
  const refreshTasks = useCallback(() => {
    return fetchTasks(true);
  }, [fetchTasks]);

  // Apply client-side filtering when filters change
  useEffect(() => {
    if (isClientSideFiltering) {
      applyClientSideFilters();
    }
  }, [currentFilters, isClientSideFiltering, applyClientSideFilters]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Update filters in URL and trigger fetch/filter
  const updateFilters = useCallback(
    (params: Record<string, string | null>) => {
      const urlParams = new URLSearchParams(searchParams.toString());

      // Set or remove each parameter
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          urlParams.delete(key);
        } else {
          urlParams.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      urlParams.set("page", "1");

      router.push(`?${urlParams.toString()}`);
    },
    [searchParams, router]
  );

  return {
    tasks: filteredTasks,
    isLoading,
    pagination,
    updateFilters,
    refreshTasks,
    isClientSideFiltering,
    lastRefreshTimestamp,
  };
}
