import { backendFetch } from '@/lib/api/backend';
import { NextResponse } from 'next/server';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  const res = await backendFetch('POST', `/arena/admin/settle/${weekId}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
