import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { coordinatesSchema } from '@/lib/utils/validation';
import { fetchGoogleUVIndex } from '@/lib/api/google-uv-index';
import { enforceRateLimit, requireSameOrigin } from '@/lib/utils/request-security';

const querySchema = z.object({
  cityName: z.string().trim().min(1).max(120).optional(),
  region: z.string().trim().max(120).optional(),
});

export async function GET(request: NextRequest) {
  const sameOriginError = requireSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = await enforceRateLimit(request, {
    prefix: 'api:uv-index',
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat') || '';
  const lon = searchParams.get('lon') || '';

  const coordinates = coordinatesSchema.safeParse({ lat, lon });
  if (!coordinates.success) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const query = querySchema.safeParse({
    cityName: searchParams.get('cityName') || undefined,
    region: searchParams.get('region') || undefined,
  });

  if (!query.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { lat: latitude, lon: longitude } = coordinates.data;
  const cityName = query.data.cityName || 'Unknown location';

  const data = await fetchGoogleUVIndex(
    latitude,
    longitude,
    cityName,
    query.data.region
  );

  if (!data) {
    return NextResponse.json(
      { error: 'UV index data is not available' },
      { status: 503 }
    );
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300',
    },
  });
}
