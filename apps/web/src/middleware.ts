import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware for authentication and route protection
 *
 * Replaces Clerk middleware with custom JWT verification
 */

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/votes',
  '/download',
  '/sign-in',
  '/sign-up',
  '/how-it-works',
];

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/google',
  '/api/auth/callback',
  '/api/webhooks',
  '/api/votes',
];

/**
 * Check if path matches any of the patterns
 */
function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith('*')) {
      return path.startsWith(pattern.slice(0, -1));
    }
    if (pattern.includes('(.*)')) {
      const regex = new RegExp('^' + pattern.replace('(.*)', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern || path.startsWith(pattern + '/');
  });
}

/**
 * Check if request has valid session
 */
async function hasValidSession(request: NextRequest): Promise<boolean> {
  // Check for session cookie
  const sessionCookie = request.cookies.get('sync-session')?.value;
  if (!sessionCookie) {
    return false;
  }

  // We can't verify JWT in edge middleware without importing jose
  // Instead, we'll check if the cookie exists and let the API verify it
  // For now, just check if cookie is present and looks like a JWT
  const parts = sessionCookie.split('.');
  return parts.length === 3;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Has file extension
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = matchesPattern(pathname, publicRoutes);
  const isPublicApiRoute = matchesPattern(pathname, publicApiRoutes);

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // For API routes, check auth and return 401 if not authenticated
  if (pathname.startsWith('/api/')) {
    const hasSession = await hasValidSession(request);
    if (!hasSession) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // For protected pages, redirect to sign-in if not authenticated
  const hasSession = await hasValidSession(request);
  if (!hasSession) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
