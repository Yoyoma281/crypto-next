import { backendFetch } from '@/lib/api/backend';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch('PATCH', `/arena/admin/week/${weekId}`, body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
