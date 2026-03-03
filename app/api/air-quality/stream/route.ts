import { NextRequest, NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import {
  enforceRateLimit,
  getClientIp,
  requireSameOrigin,
} from '@/lib/utils/request-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_CONNECTIONS_PER_IP = 3;
const activeConnections = new Map<string, number>();

export async function GET(request: NextRequest) {
  const sameOriginError = requireSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = await enforceRateLimit(request, {
    prefix: 'api:air-quality-stream',
    limit: 15,
    windowMs: 60 * 1000,
    message: 'Too many stream connection attempts. Please try again later.',
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const ip = getClientIp(request);
  const currentConnections = activeConnections.get(ip) || 0;
  if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
    return NextResponse.json(
      { error: 'Too many concurrent stream connections' },
      { status: 429 }
    );
  }

  activeConnections.set(ip, currentConnections + 1);
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        const remaining = Math.max((activeConnections.get(ip) || 1) - 1, 0);
        if (remaining === 0) {
          activeConnections.delete(ip);
        } else {
          activeConnections.set(ip, remaining);
        }
        try {
          controller.close();
        } catch {
          // Stream may already be closed.
        }
      };

      // Send initial data
      try {
        const data = await fetchAllAirQualityData();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }

      // Set up interval for updates
      const intervalId = setInterval(async () => {
        try {
          const data = await fetchAllAirQualityData();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          console.error('Error fetching data:', error);
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`)
          );
        }
      }, 60000); // Update every minute

      // Keep-alive event to avoid intermediary timeouts
      const heartbeatId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(heartbeatId);
          clearInterval(intervalId);
          close();
        }
      }, 25000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        clearInterval(heartbeatId);
        close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
