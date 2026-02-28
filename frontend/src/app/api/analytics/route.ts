import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const periods = ['1d', '5d', '1mo', '3mo', '1y'];
    const results: Record<string, unknown> = {};

    for (const period of periods) {
      const res = await fetch(`${API_BASE}/api/themes?period=${period}`, {
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const data = await res.json();
        const themes = data.themes || [];
        const avgReturn =
          themes.length > 0
            ? themes.reduce((sum: number, t: { change_percent: number }) => sum + (t.change_percent || 0), 0) /
              themes.length
            : 0;
        results[period] = {
          theme_count: themes.length,
          average_return: Number(avgReturn.toFixed(4)),
          best_theme: themes[0]?.name || null,
          worst_theme: themes[themes.length - 1]?.name || null,
        };
      }
    }

    return NextResponse.json({
      analytics: results,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
