import { Suspense } from "react";
import LoginForm from "@/app/(auth)/login/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md animate-pulse rounded-lg bg-white p-8 shadow-lg">
            <div className="h-8 w-3/4 rounded bg-gray-200"></div>
            <div className="mt-4 h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="mt-8 space-y-4">
              <div className="h-10 rounded bg-gray-200"></div>
              <div className="h-10 rounded bg-gray-200"></div>
              <div className="h-10 rounded bg-gray-200"></div>
            </div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
