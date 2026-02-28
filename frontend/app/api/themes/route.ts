import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period') || '1d';

  try {
    const res = await fetch(`${API_BASE}/api/themes?period=${period}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch themes' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
