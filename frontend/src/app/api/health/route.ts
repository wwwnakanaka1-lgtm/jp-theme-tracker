import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      cache: 'no-store',
    });

    const backendHealth = res.ok ? await res.json() : { status: 'unreachable' };

    return NextResponse.json({
      status: 'ok',
      frontend: { status: 'healthy', version: '2.0.0' },
      backend: backendHealth,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: 'degraded',
      frontend: { status: 'healthy', version: '2.0.0' },
      backend: { status: 'unreachable' },
      timestamp: new Date().toISOString(),
    });
  }
}
