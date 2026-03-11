/**
 * Proxy helper for the Express backend (localhost:3001).
 *
 * Always runs server-side (route handlers / server components).
 * Automatically forwards the `token` cookie so the backend can
 * authenticate the request.
 */

import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

export async function backendFetch(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Cookie"] = `token=${token}`;

  return fetch(`${BACKEND}${path}`, {
    method,
    headers,
    cache: "no-store", // user-specific data — never cache
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}
