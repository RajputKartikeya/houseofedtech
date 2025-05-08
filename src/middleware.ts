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
    path.includes(".");

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect logic
  if (isPublicPath && token) {
    // If the user is logged in and tries to access a public page,
    // redirect them to the dashboard
    if (path === "/login" || path === "/register") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (!isPublicPath && !token) {
    // If the user is not logged in and tries to access a protected page,
    // redirect them to the login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  // Skip API routes except for those that we want to protect
  // We exclude /api/auth because NextAuth.js handles that
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
