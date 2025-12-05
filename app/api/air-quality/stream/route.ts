import { NextRequest } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
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

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
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
