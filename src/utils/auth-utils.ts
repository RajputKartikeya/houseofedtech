"use client";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

/**
 * Enhanced signIn function with better error handling
 */
export async function signIn(
  credentials: { email: string; password: string },
  callbackUrl: string = "/dashboard"
) {
  try {
    const result = await nextAuthSignIn("credentials", {
      ...credentials,
      redirect: false,
    });

    if (!result?.ok) {
      return {
        error: result?.error || "Failed to sign in",
        success: false,
      };
    }

    // Manually redirect after successful login
    window.location.href = callbackUrl;
    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    };
  }
}

/**
 * Enhanced signOut function with better error handling
 */
export async function signOut(callbackUrl: string = "/login") {
  try {
    await nextAuthSignOut({ redirect: false });
    window.location.href = callbackUrl;
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    };
  }
}
