import { backendFetch } from '@/lib/api/backend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await backendFetch('POST', '/arena/admin/disqualify', body);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
