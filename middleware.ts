import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 60 // 60 requests per minute

// In-memory store for rate limiting
// Note: In production, use Redis or similar for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; timestamp: number }>()

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = request.ip || "unknown"

  // Check rate limit
  const now = Date.now()
  const rateLimit = rateLimitStore.get(ip) || { count: 0, timestamp: now }

  // Reset count if window has passed
  if (now - rateLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.count = 0
    rateLimit.timestamp = now
  }

  // Increment count
  rateLimit.count++
  rateLimitStore.set(ip, rateLimit)

  // Check if rate limit exceeded
  if (rateLimit.count > MAX_REQUESTS_PER_WINDOW) {
    return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": (rateLimit.timestamp + RATE_LIMIT_WINDOW).toString(),
      },
    })
  }

  // Add rate limit headers
  const response = NextResponse.next()
  response.headers.set("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString())
  response.headers.set("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS_PER_WINDOW - rateLimit.count).toString())
  response.headers.set("X-RateLimit-Reset", (rateLimit.timestamp + RATE_LIMIT_WINDOW).toString())

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}
