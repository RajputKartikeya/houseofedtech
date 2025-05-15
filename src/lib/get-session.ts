"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Safe wrapper for getServerSession that works in server components
export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Export auth function for compatibility with existing code
export const auth = getSession;
