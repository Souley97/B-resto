import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth")

  // Allow access to the login page
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next()
  }

  // Protect other admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !authCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

