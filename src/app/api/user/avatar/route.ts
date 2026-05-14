import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch } from "@/lib/api/backend";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

// PUT /api/user/avatar
// Handles two cases:
//   1. JSON body { avatar: string } — DiceBear URL selection
//   2. multipart/form-data with an `avatar` file field — file upload
export async function PUT(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    // File upload path — forward the FormData directly so multer can parse it
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const formData = await req.formData();
    const backendRes = await fetch(`${BACKEND}/user/avatar/upload`, {
      method: "PUT",
      headers: token ? { Cookie: `token=${token}` } : {},
      body: formData, // FormData sets its own Content-Type with boundary
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  }

  // JSON path — DiceBear avatar URL
  const body = await req.json();
  const res = await backendFetch("PUT", "/user/avatar", body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
