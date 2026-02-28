import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';
  const theme = request.nextUrl.searchParams.get('theme') || '';

  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (theme) params.set('theme', theme);

    const res = await fetch(`${API_BASE}/api/stocks?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
