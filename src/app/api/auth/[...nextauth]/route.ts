import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth/next";

// Create a NextAuth handler with the auth options
const handler = NextAuth(authOptions);

// Export the handler as all necessary HTTP methods
export const GET = handler;
export const POST = handler;
export const HEAD = handler;
export const OPTIONS = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
