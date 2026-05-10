import { NextRequest, NextResponse } from "next/server";

const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" }
  });
}

export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/api/sync") {
    const authHeader = request.headers.get("authorization") ?? "";
    const expected = process.env.CRON_SECRET;
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!expected || token !== expected) {
      return withSecurityHeaders(unauthorizedResponse());
    }
  }

  const response = NextResponse.next();
  return withSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
