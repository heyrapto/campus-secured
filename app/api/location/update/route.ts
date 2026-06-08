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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Location Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
