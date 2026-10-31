import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSecurityHeaders } from "@/lib/security/headers";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine if this is a lab route
  const isLabRoute = pathname.startsWith("/labs/");

  // Get appropriate security headers
  const securityHeaders = getSecurityHeaders(isLabRoute);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/scanner", "/learn"];
  const adminRoutes = ["/admin"];

  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
