import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/chat"];
const PUBLIC_AUTH_PATHS = ["/", "/login", "/register"];

/**
 * This is an optimistic route check only. The backend remains the authority
 * for authentication and authorization. We only inspect token expiry here
 * so stale cookies do not create redirect loops.
 */
function hasValidSessionCookie(request: NextRequest): boolean {
  const now = Math.floor(Date.now() / 1000);

  return ["accessToken", "refreshToken"].some((name) => {
    const token = request.cookies.get(name)?.value;
    if (!token) return false;

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    try {
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { exp?: unknown };

      return typeof payload.exp === "number" && payload.exp > now;
    } catch {
      return false;
    }
  });
}

function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasValidSessionCookie(request);

  if (matchesPath(pathname, PROTECTED_PATHS) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (matchesPath(pathname, PUBLIC_AUTH_PATHS) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/chat/:path*"],
};
