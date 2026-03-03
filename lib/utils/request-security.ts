import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    forwardedFor?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export async function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const result = await checkRateLimit({ key, limit, windowMs });
  return result.limited;
}

export async function enforceRateLimit(
  request: NextRequest,
  options: {
    prefix: string;
    limit: number;
    windowMs: number;
    keySuffix?: string;
    message?: string;
  }
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const key = `${options.prefix}:${ip}${options.keySuffix ? `:${options.keySuffix}` : ''}`;
  const result = await checkRateLimit({
    key,
    limit: options.limit,
    windowMs: options.windowMs,
  });

  if (!result.limited) {
    return null;
  }

  return NextResponse.json(
    { error: options.message || 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': result.resetSeconds.toString(),
        'X-RateLimit-Limit': options.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Policy': `${options.limit};w=${Math.ceil(options.windowMs / 1000)}`,
        'X-RateLimit-Source': result.source,
      },
    }
  );
}

function parseOriginFromReferer(referer: string | null): string | null {
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function requireApiToken(
  request: NextRequest,
  envVarName: string = 'NOTIFICATIONS_API_TOKEN'
): NextResponse | null {
  const token = process.env[envVarName];
  if (!token) {
    return NextResponse.json(
      { error: `${envVarName} is not configured` },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  const apiKeyHeader = request.headers.get('x-api-key');
  const provided = bearerToken || apiKeyHeader;

  if (!provided || provided !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export function requireJsonContentType(request: NextRequest): NextResponse | null {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { error: 'Unsupported content type' },
      { status: 415 }
    );
  }

  return null;
}

export function requireMaxBodySize(
  request: NextRequest,
  maxBytes: number
): NextResponse | null {
  const contentLengthHeader = request.headers.get('content-length');
  if (!contentLengthHeader) {
    return null;
  }

  const contentLength = Number.parseInt(contentLengthHeader, 10);
  if (!Number.isFinite(contentLength)) {
    return null;
  }

  if (contentLength > maxBytes) {
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413 }
    );
  }

  return null;
}

export function requireSameOrigin(request: NextRequest): NextResponse | null {
  const originHeader = request.headers.get('origin');
  const refererOrigin = parseOriginFromReferer(request.headers.get('referer'));

  if (!originHeader && !refererOrigin) {
    return NextResponse.json(
      { error: 'Missing origin context' },
      { status: 403 }
    );
  }

  const allowedOrigins = new Set<string>([request.nextUrl.origin]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

  if (appUrl) {
    try {
      allowedOrigins.add(new URL(appUrl).origin);
    } catch {
      // Ignore invalid configured URL
    }
  }

  if (vercelUrl) {
    const normalized = vercelUrl.startsWith('http')
      ? vercelUrl
      : `https://${vercelUrl}`;
    try {
      allowedOrigins.add(new URL(normalized).origin);
    } catch {
      // Ignore invalid configured URL
    }
  }

  const isAllowed =
    (originHeader ? allowedOrigins.has(originHeader) : false) ||
    (refererOrigin ? allowedOrigins.has(refererOrigin) : false);

  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  return null;
}
