import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    const pathname = req.nextUrl.pathname;

    console.log("Token:", token);
    console.log("Token role:", token?.role);
    console.log("Requested Path:", pathname);

    if (!token) {
      console.log("🚫 No token found - Redirecting to /authentification");
      return NextResponse.redirect(new URL("/authentification", req.url));
    }
    // Extract the role from the URL
    const pathSegments = pathname.split("/");
    const requestedRole = pathSegments[2]?.toUpperCase();
    const userRole = token.role?.toUpperCase();

    console.log("User Role:", userRole);
    console.log("Requested Role:", requestedRole);

      if (pathname.startsWith("/admin") && (userRole !== "ADMIN")) {
        console.log("🚫 Access denied to /admin - User role:", userRole)
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    // Role-based access control
    if (pathname.startsWith("/dashboard/") && requestedRole && userRole) {
      if (requestedRole !== userRole) {
        console.log("🚫 Access denied - Role mismatch");
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/authentification", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};