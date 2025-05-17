import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  console.log("Token:", token);
  console.log("Requested Path:", pathname);

  // 🔐 Redirect to /authentication if the user is not logged in
  /*if (!token || !token.role) {
    console.log("🚫 Unauthenticated - Redirecting to /authentification");
    return NextResponse.redirect(new URL("/authentification", req.url));
  }*/

  // ✅ Extract the role from the URL (third segment in "/dashboard//{role}/*")
  const pathSegments = pathname.split("/");
  const requestedRole = null//pathSegments[3]?.toUpperCase(); // Convert to uppercase
  const userRole = token?.role?.toUpperCase()// Convert to uppercase

  console.log("Logged-in Role:", userRole);
  console.log("Requested Role:", requestedRole);

  // 🚫 If trying to access "/dashboard//{role}/*", enforce role-based restriction
  if (pathname.startsWith("/dashboard/") && requestedRole) {
    if (requestedRole !== userRole) {
      console.log("🚫 Access denied - Role mismatch:", { loggedIn: userRole, requested: requestedRole });
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

// 🔥 Apply middleware to all "/dashboard" routes
export const config = {
  //matcher: ["/dashboard/:path*", "/dashboard/:path/:role/:path*"],
};