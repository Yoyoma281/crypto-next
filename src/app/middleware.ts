import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'token';
const LOGIN_PATH = process.env.LOGIN_PATH ?? '/login';
const API_VALIDATE_URL = process.env.API_VALIDATE_URL ?? '';

// Paths that don't require auth — checked with startsWith
const PUBLIC_PATHS = [
  LOGIN_PATH,
  '/signup',
  '/public',
  '/api/auth',
  '/api/me',
  '/api/register',
  '/Exchange',
  '/coin',
  '/news',
  '/learn',
  '/legal',
  '/leaderboard',
  '/copy-trading',
  '/watchlist',
  '/forgot-password',
  '/reset-password',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Root home page is always public
  if (pathname === '/') return NextResponse.next();

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, req.url);
    loginUrl.searchParams.set('returnTo', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (API_VALIDATE_URL) {
    try {
      const res = await fetch(API_VALIDATE_URL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const loginUrl = new URL(LOGIN_PATH, req.url);
        loginUrl.searchParams.set('returnTo', pathname + req.nextUrl.search);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL(LOGIN_PATH, req.url);
      loginUrl.searchParams.set('returnTo', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
