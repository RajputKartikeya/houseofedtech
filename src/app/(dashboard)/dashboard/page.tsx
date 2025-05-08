"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  PieChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CheckCheck,
  Hourglass,
  ClipboardList,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/utils/api-client";
import { TaskStatus } from "@/types";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasksCount: number;
  dueSoonTasksCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasksCount: 0,
    dueSoonTasksCount: 0,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);

        // Get all tasks
        const response = await apiClient.getTasks();

        // Calculate stats
        const tasks = response.tasks || [];
        const completedTasks = tasks.filter(
          (task: any) => task.status === TaskStatus.COMPLETED
        ).length;
        const inProgressTasks = tasks.filter(
          (task: any) => task.status === TaskStatus.IN_PROGRESS
        ).length;
        const pendingTasks = tasks.filter(
          (task: any) => task.status === TaskStatus.TODO
        ).length;

        // Calculate overdue and due soon tasks
        const now = new Date();

        // Tasks that are overdue (due date is in the past and not completed)
        const overdueTasksCount = tasks.filter((task: any) => {
          if (!task.dueDate || task.status === TaskStatus.COMPLETED)
            return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < now;
        }).length;

        // Tasks that are due in the next 3 days and not completed
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        const dueSoonTasksCount = tasks.filter((task: any) => {
          if (!task.dueDate || task.status === TaskStatus.COMPLETED)
            return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= now && dueDate <= threeDaysFromNow;
        }).length;

        setStats({
          totalTasks: tasks.length,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          overdueTasksCount,
          dueSoonTasksCount,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      description: "All tasks in the system",
      icon: ClipboardList,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      description: "Tasks marked as completed",
      icon: CheckCheck,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks,
      description: "Tasks currently in progress",
      icon: Hourglass,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "To Do",
      value: stats.pendingTasks,
      description: "Tasks waiting to be started",
      icon: CheckCircle2,
      iconColor: "text-gray-500",
      bgColor: "bg-gray-50",
    },
    {
      title: "Overdue",
      value: stats.overdueTasksCount,
      description: "Tasks past their due date",
      icon: AlertTriangle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Due Soon",
      value: stats.dueSoonTasksCount,
      description: "Tasks due in the next 3 days",
      icon: Clock,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-500">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back, {session?.user?.name}. Here's an overview of your tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-full`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional dashboard content can be added here */}
    </div>
  );
}
