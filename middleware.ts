import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and public paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  // Helper to parse role from JWT payload safely in edge middleware
  let role: string | null = null;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        role = payload.role;
      }
    } catch {
      role = null;
    }
  }

  // If visiting root /
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If visiting /login with active token
  if (pathname === "/login") {
    if (token && role) {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      if (role === "FACULTY") return NextResponse.redirect(new URL("/faculty/dashboard", request.url));
      if (role === "INVIGILATOR") return NextResponse.redirect(new URL("/invigilator/dashboard", request.url));
      if (role === "STUDENT") return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected paths
  const protectedPrefixes = ["/admin", "/faculty", "/invigilator", "/student", "/exam"];
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    if (!token || !role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route authorization
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/faculty") && role !== "FACULTY" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/invigilator") && role !== "INVIGILATOR" && role !== "FACULTY" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/exam") && role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
