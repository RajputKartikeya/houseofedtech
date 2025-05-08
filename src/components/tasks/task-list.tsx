"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  CheckCircle,
  ArrowUpCircle,
  Circle,
  Clock,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskStatus, TaskPriority } from "@/types";
import { apiClient } from "@/utils/api-client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskListProps {
  status?: TaskStatus;
  category?: string;
  onEditTask?: (task: Task) => void;
  onTasksUpdated?: () => void;
}

export function TaskList({
  status,
  category,
  onEditTask,
  onTasksUpdated,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>(
    {}
  );
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  // Create a new URLSearchParams instance for building query params
  const buildQueryParams = (overrides: Record<string, string> = {}) => {
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
  };

  // Fetch tasks based on filters
  const fetchTasks = async () => {
    try {
      setIsLoading(true);

      const params = buildQueryParams();
      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "10");
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const response = await apiClient.getTasks(params);

      setTasks(response.tasks);
      setPagination(
        response.pagination || {
          total: response.tasks.length,
          page,
          limit,
          totalPages: Math.ceil(response.tasks.length / limit),
        }
      );
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for search param changes and re-fetch tasks
  useEffect(() => {
    if (searchParams) {
      fetchTasks();
    }
  }, [searchParams]);

  // Delete task handler
  const deleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await apiClient.deleteTask(taskToDelete);
      toast.success("Task deleted successfully");
      fetchTasks();

      if (onTasksUpdated) {
        onTasksUpdated();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await apiClient.updateTask(taskId, { status: newStatus });

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast.success("Task status updated");

      if (onTasksUpdated) {
        onTasksUpdated();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected: Record<string, boolean> = {};
      tasks.forEach((task) => {
        newSelected[task.id] = true;
      });
      setSelectedTasks(newSelected);
    } else {
      setSelectedTasks({});
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    setSelectedTasks((prev) => ({
      ...prev,
      [taskId]: checked,
    }));
  };

  const getSelectedTasksCount = () => {
    return Object.values(selectedTasks).filter(Boolean).length;
  };

  const bulkDeleteTasks = async () => {
    const tasksToDelete = Object.entries(selectedTasks)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (tasksToDelete.length === 0) return;

    try {
      // In a real app, you might want to add a bulk delete API
      // For now, we'll delete them one by one
      await Promise.all(tasksToDelete.map((id) => apiClient.deleteTask(id)));

      toast.success(`${tasksToDelete.length} tasks deleted successfully`);
      fetchTasks();
      setSelectedTasks({});

      if (onTasksUpdated) {
        onTasksUpdated();
      }
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast.error("Failed to delete tasks");
    }
  };

  // Status badge renderer
  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return (
          <div className="flex items-center">
            <Circle className="mr-2 h-4 w-4 text-gray-500" />
            <span>To Do</span>
          </div>
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <div className="flex items-center">
            <ArrowUpCircle className="mr-2 h-4 w-4 text-blue-500" />
            <span>In Progress</span>
          </div>
        );
      case TaskStatus.COMPLETED:
        return (
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            <span>Completed</span>
          </div>
        );
      default:
        return status;
    }
  };

  // Priority badge renderer
  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Low
          </span>
        );
      case TaskPriority.MEDIUM:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            Medium
          </span>
        );
      case TaskPriority.HIGH:
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            High
          </span>
        );
      default:
        return priority;
    }
  };

  // Due date renderer
  const renderDueDate = (dueDate?: string) => {
    if (!dueDate) return "No due date";

    const date = new Date(dueDate);
    const now = new Date();
    const isPast = date < now;

    // Task is overdue
    if (isPast) {
      return (
        <div className="flex items-center text-red-600">
          <AlertTriangle className="mr-1 h-4 w-4" />
          <span>{format(date, "MMM d, yyyy")}</span>
        </div>
      );
    }

    // Due soon (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    if (date <= threeDaysFromNow) {
      return (
        <div className="flex items-center text-amber-600">
          <Clock className="mr-1 h-4 w-4" />
          <span>{format(date, "MMM d, yyyy")}</span>
        </div>
      );
    }

    // Regular due date
    return format(date, "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="mb-2 text-xl font-semibold text-gray-700">
          No tasks found
        </p>
        <p className="text-gray-500">
          {status
            ? `You don't have any tasks with status "${status}"`
            : "You don't have any tasks yet"}
        </p>
      </div>
    );
  }

  const selectedCount = getSelectedTasksCount();

  return (
    <div className="space-y-4">
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
          <span className="text-sm font-medium">
            {selectedCount} task{selectedCount > 1 ? "s" : ""} selected
          </span>
          <Button variant="destructive" size="sm" onClick={bulkDeleteTasks}>
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    tasks.length > 0 && getSelectedTasksCount() === tasks.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="max-w-[200px]">Title</TableHead>
              <TableHead className="hidden md:table-cell w-32">
                Status
              </TableHead>
              <TableHead className="hidden md:table-cell w-28">
                Priority
              </TableHead>
              <TableHead className="hidden lg:table-cell w-36">
                Due Date
              </TableHead>
              <TableHead className="hidden lg:table-cell w-28">
                Category
              </TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={!!selectedTasks[task.id]}
                    onCheckedChange={(checked) =>
                      handleSelectTask(task.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-medium">
                  {task.title}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {renderStatusBadge(task.status)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {renderPriorityBadge(task.priority)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {renderDueDate(task.dueDate)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {task.category ? (
                    <div className="flex items-center">
                      <Tag className="mr-1 h-4 w-4 text-gray-500" />
                      <span>{task.category.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {task.status !== TaskStatus.COMPLETED && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateTaskStatus(task.id, TaskStatus.COMPLETED)
                        }
                        title="Mark as completed"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    {onEditTask && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditTask(task)}
                        title="Edit task"
                      >
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTaskToDelete(task.id)}
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = buildQueryParams({
                page: String(pagination.page - 1),
              });
              router.push(`?${params.toString()}`);
            }}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = buildQueryParams({
                page: String(pagination.page + 1),
              });
              router.push(`?${params.toString()}`);
            }}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
