import { Suspense } from "react";
import TasksContent from "./tasks-content";

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-48 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
