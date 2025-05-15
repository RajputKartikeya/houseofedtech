import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/register" ||
    path === "/" ||
    path.startsWith("/_next") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/register") ||
    path.includes(".");

  try {
    // Only check auth for protected paths
    if (!isPublicPath) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        // If the user is not logged in and tries to access a protected page,
        // redirect them to the login page
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } else if (path === "/login" || path === "/register") {
      // For login/register pages, check if already logged in
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (token) {
        // If already logged in, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);

    // In case of errors, allow access to public paths
    // and redirect to login for protected paths
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  // Skip API routes except for those that we want to protect
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
