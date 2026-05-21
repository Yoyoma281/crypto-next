import { backendFetch } from '@/lib/api/backend';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekId = searchParams.get('weekId') ?? '';
  const userId = searchParams.get('userId') ?? '';
  const qs = new URLSearchParams();
  if (weekId) qs.set('weekId', weekId);
  if (userId) qs.set('userId', userId);
  const res = await backendFetch('GET', `/arena/snapshots?${qs}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
