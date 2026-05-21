import { backendFetch } from '@/lib/api/backend';
import { NextResponse } from 'next/server';

export async function GET() {
  const res = await backendFetch('GET', '/arena/admin/weeks');
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
