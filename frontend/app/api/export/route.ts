import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period') || '1d';
  const format = request.nextUrl.searchParams.get('format') || 'json';

  try {
    const res = await fetch(`${API_BASE}/api/themes?period=${period}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: res.status });
    }

    const data = await res.json();

    if (format === 'csv') {
      const themes = data.themes || [];
      const header = 'id,name,change_percent,stock_count\n';
      const rows = themes
        .map(
          (t: { id: string; name: string; change_percent: number; stock_count: number }) =>
            `${t.id},"${t.name}",${t.change_percent},${t.stock_count}`,
        )
        .join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="themes_${period}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
