"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormValidation } from "@/hooks/use-form-validation";
import { toast } from "sonner";
import { signIn } from "@/utils/auth-utils";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [authError, setAuthError] = useState<string | null>(null);

  // Form validation
  const { form, isSubmitting, handleSubmit } =
    useFormValidation<LoginFormValues>({
      schema: loginSchema,
      defaultValues: {
        email: "",
        password: "",
      },
    });

  // Form submission handler
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setAuthError(null);

      const result = await signIn(
        {
          email: data.email,
          password: data.password,
        },
        callbackUrl
      );

      if (!result.success) {
        setAuthError(result.error || "Invalid email or password");
        return;
      }

      toast.success("Logged in successfully");
      // No need to manually redirect as signIn handles it
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Something went wrong. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        {authError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
            {authError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <div className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
