import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  storeSubscription, 
  removeSubscription, 
} from '@/lib/notifications/push';
import {
  getClientIp,
  isRateLimited,
  requireJsonContentType,
  requireMaxBodySize,
  requireSameOrigin,
} from '@/lib/utils/request-security';

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;
const USER_ID_MAX_LENGTH = 128;

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(2048),
    auth: z.string().min(1).max(512),
  }),
});

const subscribeRequestSchema = z.object({
  subscription: subscriptionSchema,
  userId: z.string().min(1).max(USER_ID_MAX_LENGTH),
});

const unsubscribeRequestSchema = z.object({
  userId: z.string().min(1).max(USER_ID_MAX_LENGTH),
});

// Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const sameOriginError = requireSameOrigin(request);
    if (sameOriginError) {
      return sameOriginError;
    }

    const maxBodySizeError = requireMaxBodySize(request, 64 * 1024);
    if (maxBodySizeError) {
      return maxBodySizeError;
    }

    const contentTypeError = requireJsonContentType(request);
    if (contentTypeError) {
      return contentTypeError;
    }

    const ip = getClientIp(request);
    if (await isRateLimited(`push:post:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = subscribeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subscription payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { subscription, userId } = parsed.data;

    // Store subscription
    storeSubscription(userId, subscription);

    return NextResponse.json({ 
      success: true,
      message: 'Successfully subscribed to push notifications'
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const sameOriginError = requireSameOrigin(request);
    if (sameOriginError) {
      return sameOriginError;
    }

    const maxBodySizeError = requireMaxBodySize(request, 8 * 1024);
    if (maxBodySizeError) {
      return maxBodySizeError;
    }

    const contentTypeError = requireJsonContentType(request);
    if (contentTypeError) {
      return contentTypeError;
    }

    const ip = getClientIp(request);
    if (await isRateLimited(`push:delete:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = unsubscribeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    removeSubscription(userId);

    return NextResponse.json({ 
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
