import { NextRequest, NextResponse } from 'next/server';
import { getConfiguredRateLimitBackend } from '@/lib/utils/rate-limit';
import { enforceRateLimit, requireSameOrigin } from '@/lib/utils/request-security';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sameOriginError = requireSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = await enforceRateLimit(request, {
    prefix: 'api:health-rate-limit',
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const backend = getConfiguredRateLimitBackend();

  return NextResponse.json(
    {
      status: 'ok',
      backend,
      distributed: backend === 'upstash',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
