import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = ['/home', '/patients', '/invoices', '/appointments', '/services', '/reports', '/settings']

// Define public routes that don't require authentication
const publicRoutes = ['/', '/api/login', '/api/logout', '/api/verify-code', '/api/verify-auth', '/api/init-db']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes and API routes to pass through
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedRoute) {
    // Check for authentication cookie
    const userEmail = request.cookies.get('userEmail')?.value

    // If no user email cookie, redirect to login page
    if (!userEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
