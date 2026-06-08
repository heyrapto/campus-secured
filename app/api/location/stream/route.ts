import { redis } from '@/lib/redis';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const alertId = url.searchParams.get('alertId');

  if (!alertId) {
    return new Response('Missing alertId', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        try {
          // In the database alertId can be the _id or the trackToken. 
          // Assuming we use trackToken or _id to look up the location in redis.
          // In trigger/route.ts we saved it as `location:${alert._id}`.
          // For the tracking page, they only have the trackToken. Let's fix that conceptually
          // We will look up location by trackToken or by alert._id. To simplify, let's just 
          // query redis using the passed ID directly.
          const loc = await redis.get(`location:${alertId}`);
          if (loc) {
            // loc is a stringified JSON if stored with stringify, or an object if upstash parses it.
            // upstash redis REST client parses JSON automatically if it's JSON.
            const locStr = typeof loc === 'string' ? loc : JSON.stringify(loc);
            controller.enqueue(encoder.encode(`data: ${locStr}\n\n`));
          }
        } catch (e) {
          console.error('SSE interval error:', e);
        }
      }, 3000); // poll Redis every 3 seconds

      req.signal.addEventListener('abort', () => clearInterval(interval));
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
