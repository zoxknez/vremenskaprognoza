import { logger } from '@/lib/utils/logger';

interface MemoryRateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetSeconds: number;
  source: 'upstash' | 'memory';
}

const memoryStore = new Map<string, MemoryRateLimitEntry>();
const MAX_MEMORY_KEYS = 5000;
const REDIS_TIMEOUT_MS = 1200;

function cleanupMemoryStore(now: number, windowMs: number) {
  for (const [key, value] of memoryStore.entries()) {
    if (now - value.windowStart > windowMs) {
      memoryStore.delete(key);
    }
  }

  if (memoryStore.size > MAX_MEMORY_KEYS) {
    const oldest = Array.from(memoryStore.entries())
      .sort((a, b) => a[1].windowStart - b[1].windowStart)
      .slice(0, memoryStore.size - MAX_MEMORY_KEYS + 250);

    for (const [key] of oldest) {
      memoryStore.delete(key);
    }
  }
}

function checkMemoryRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupMemoryStore(now, options.windowMs);

  const existing = memoryStore.get(options.key);
  if (!existing) {
    memoryStore.set(options.key, { count: 1, windowStart: now });
    return {
      limited: false,
      remaining: Math.max(options.limit - 1, 0),
      resetSeconds: Math.ceil(options.windowMs / 1000),
      source: 'memory',
    };
  }

  if (now - existing.windowStart > options.windowMs) {
    memoryStore.set(options.key, { count: 1, windowStart: now });
    return {
      limited: false,
      remaining: Math.max(options.limit - 1, 0),
      resetSeconds: Math.ceil(options.windowMs / 1000),
      source: 'memory',
    };
  }

  existing.count += 1;

  return {
    limited: existing.count > options.limit,
    remaining: Math.max(options.limit - existing.count, 0),
    resetSeconds: Math.max(
      Math.ceil((options.windowMs - (now - existing.windowStart)) / 1000),
      1
    ),
    source: 'memory',
  };
}

function getUpstashConfig():
  | { url: string; token: string }
  | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return {
    url: url.endsWith('/') ? url.slice(0, -1) : url,
    token,
  };
}

export function getConfiguredRateLimitBackend(): 'upstash' | 'memory' {
  return getUpstashConfig() ? 'upstash' : 'memory';
}

async function runUpstashPipeline(
  config: { url: string; token: string },
  commands: string[][]
): Promise<unknown[]> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
    signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Upstash pipeline failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('Invalid Upstash pipeline response');
  }

  return payload.map((entry: { result?: unknown; error?: unknown }) => {
    if (entry?.error) {
      throw new Error(String(entry.error));
    }
    return entry?.result;
  });
}

async function checkUpstashRateLimit(
  options: RateLimitOptions,
  config: { url: string; token: string }
): Promise<RateLimitResult> {
  const key = `rl:${options.key}`;

  const [incrResult, pttlResult] = await runUpstashPipeline(config, [
    ['INCR', key],
    ['PTTL', key],
  ]);

  const count = Number(incrResult);
  let ttlMs = Number(pttlResult);

  if (!Number.isFinite(count) || count < 1) {
    throw new Error('Invalid INCR result from Upstash');
  }

  if (count === 1 || !Number.isFinite(ttlMs) || ttlMs < 0) {
    const [, refreshedTtl] = await runUpstashPipeline(config, [
      ['PEXPIRE', key, String(options.windowMs)],
      ['PTTL', key],
    ]);
    ttlMs = Number(refreshedTtl);
  }

  if (!Number.isFinite(ttlMs) || ttlMs < 0) {
    ttlMs = options.windowMs;
  }

  return {
    limited: count > options.limit,
    remaining: Math.max(options.limit - count, 0),
    resetSeconds: Math.max(Math.ceil(ttlMs / 1000), 1),
    source: 'upstash',
  };
}

export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const upstashConfig = getUpstashConfig();
  if (!upstashConfig) {
    return checkMemoryRateLimit(options);
  }

  try {
    return await checkUpstashRateLimit(options, upstashConfig);
  } catch (error) {
    logger.warn('Upstash rate limit failed, falling back to memory:', error);
    return checkMemoryRateLimit(options);
  }
}
