import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { unstable_cache, revalidateTag } from "next/cache";
import { backendFetch } from "@/lib/api/backend";

const CACHE_TAG = "user-favorites";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

const getCachedFavorites = unstable_cache(
  async (token: string) => {
    const res = await fetch(`${BACKEND}/favorites`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: `token=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { favorites: [] as string[] };
    return res.json() as Promise<{ favorites: string[] }>;
  },
  [CACHE_TAG],
  { tags: [CACHE_TAG], revalidate: 3600 }
);

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ favorites: [] });

  const data = await getCachedFavorites(token);
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json(); // { favorites: string[] }
  const res = await backendFetch("PUT", "/favorites", body);
  const data = await res.json();

  if (res.ok) revalidateTag(CACHE_TAG, {});
  return NextResponse.json(data, { status: res.status });
}
