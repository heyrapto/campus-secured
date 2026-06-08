import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { alertId, lat, lng } = await req.json();

    if (!alertId || !lat || !lng) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Cache location in Redis with TTL (e.g. 6 hours)
    await redis.set(`location:${alertId}`, JSON.stringify({ lat, lng }), { ex: 21600 });

    // Notify WS Server
    const botUrl = process.env.WA_BOT_URL || 'http://localhost:3001';
    fetch(`${botUrl}/ws/update-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackToken: alertId, lat, lng })
    }).catch(e => console.error('WS location update failed', e));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Location Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
