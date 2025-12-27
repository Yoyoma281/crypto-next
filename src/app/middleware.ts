import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'auth_token';
const LOGIN_PATH = process.env.LOGIN_PATH ?? '/login';
const PUBLIC_PATHS = [LOGIN_PATH, '/signup', '/public', '/api/auth']; // Paths that don’t require auth
const API_VALIDATE_URL = process.env.API_VALIDATE_URL ?? ''; // optional backend endpoint to validate token

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths, static assets and Next internals without auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.includes('.') // static files like .png .svg
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // If no token, redirect to login and preserve return path
  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, req.url);
    loginUrl.searchParams.set('returnTo', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token with backend
  // If an API_VALIDATE_URL is provided, optionally validate token server-side
  if (API_VALIDATE_URL) {
    try {
      const res = await fetch(API_VALIDATE_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const loginUrl = new URL(LOGIN_PATH, req.url);
        loginUrl.searchParams.set('returnTo', req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Auth validation failed:', err);
      const loginUrl = new URL(LOGIN_PATH, req.url);
      loginUrl.searchParams.set('returnTo', req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // No external validation configured — allow request when cookie exists
  return NextResponse.next();
}

// Only run middleware on these routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
