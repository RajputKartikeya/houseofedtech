"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskPriority, TaskStatus } from "@/types";

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  // Get filter values from URL
  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const categoryId = searchParams.get("categoryId") || "";

  // Update search parameters in URL
  const updateFilters = (params: Record<string, string | null>) => {
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
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm || null });
  };

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    updateFilters({ status: value === "all" ? null : value });
  };

  const handlePriorityChange = (value: string) => {
    updateFilters({ priority: value === "all" ? null : value });
  };

  // Task form handlers
  const handleCreateTask = () => {
    setCreateDialogOpen(true);
  };

  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
  };

  const handleTaskFormSuccess = () => {
    setCreateDialogOpen(false);
    setTaskToEdit(null);
  };

  const handleCloseTaskForm = () => {
    setCreateDialogOpen(false);
    setTaskToEdit(null);
  };

  // Map task data for edit form
  const getInitialFormData = () => {
    if (!taskToEdit) return undefined;

    return {
      title: taskToEdit.title,
      description: taskToEdit.description || "",
      status: taskToEdit.status,
      priority: taskToEdit.priority,
      dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null,
      categoryId: taskToEdit.category?.id || null,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={handleCreateTask}>
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Filter tasks to find what you're looking for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </form>
            </div>

            {/* Status filter */}
            <div className="w-full md:w-48">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority filter */}
            <div className="w-full md:w-48">
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task list */}
      <TaskList onEditTask={handleEditTask} onTasksUpdated={() => {}} />

      {/* Create task dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new task
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            onSuccess={handleTaskFormSuccess}
            onCancel={handleCloseTaskForm}
          />
        </DialogContent>
      </Dialog>

      {/* Edit task dialog */}
      <Dialog
        open={!!taskToEdit}
        onOpenChange={(open) => !open && setTaskToEdit(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details of your task
            </DialogDescription>
          </DialogHeader>
          {taskToEdit && (
            <TaskForm
              initialData={getInitialFormData()}
              taskId={taskToEdit.id}
              onSuccess={handleTaskFormSuccess}
              onCancel={handleCloseTaskForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
