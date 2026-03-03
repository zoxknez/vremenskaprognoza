import { NextRequest, NextResponse } from 'next/server';
import { sendAirQualityAlert, sendDailyDigest } from '@/lib/notifications/email';
import { z } from 'zod';
import {
  getClientIp,
  isRateLimited,
  requireApiToken,
  requireJsonContentType,
  requireMaxBodySize,
} from '@/lib/utils/request-security';

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

const alertPayloadSchema = z.object({
  cityName: z.string().min(1).max(120),
  aqi: z.number().min(0).max(500),
  aqiCategory: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  recommendations: z.array(z.string().min(1).max(200)).max(10).optional(),
});

const digestPayloadSchema = z.object({
  cities: z.array(
    z.object({
      name: z.string().min(1).max(120),
      aqi: z.number().min(0).max(500),
      category: z.string().min(1).max(50),
    })
  ).min(1).max(100),
});

const requestSchema = z.object({
  type: z.enum(['alert', 'digest']),
  email: z.string().email(),
  data: z.unknown(),
});

// Send email notification
export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireApiToken(request);
    if (unauthorized) {
      return unauthorized;
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
    if (await isRateLimited(`email:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, email, data } = parsed.data;

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Missing email or notification type' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'alert':
        {
        const alertData = alertPayloadSchema.safeParse(data);
        if (!alertData.success) {
          return NextResponse.json(
            { error: 'Invalid alert payload', details: alertData.error.flatten() },
            { status: 400 }
          );
        }

        success = await sendAirQualityAlert(email, {
          cityName: alertData.data.cityName,
          aqi: alertData.data.aqi,
          aqiCategory: alertData.data.aqiCategory || 'moderate',
          timestamp: alertData.data.timestamp || new Date().toISOString(),
          recommendations: alertData.data.recommendations || [
            'Pratite kvalitet vazduha',
            'Izbegavajte dugotrajne aktivnosti napolju ako je AQI visok'
          ],
          dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://airquality.app'
        });
        break;
        }

      case 'digest':
        {
        const digestData = digestPayloadSchema.safeParse(data);
        if (!digestData.success) {
          return NextResponse.json(
            { error: 'Invalid digest payload', details: digestData.error.flatten() },
            { status: 400 }
          );
        }
        success = await sendDailyDigest(email, digestData.data.cities);
        break;
        }

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}
