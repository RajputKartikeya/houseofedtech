"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

/**
 * Server-side function to check if a user is authenticated
 * Redirects to login if not authenticated
 * Returns the session if authenticated
 */
export async function checkAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Server-side function to check if a user has admin role
 * Redirects to dashboard if not admin
 * Returns the session if admin
 */
export async function checkAdmin() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}
