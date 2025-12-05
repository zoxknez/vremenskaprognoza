import { NextRequest, NextResponse } from 'next/server';
import { sendAirQualityAlert, sendDailyDigest } from '@/lib/notifications/email';

// Send email notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, data } = body;

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Missing email or notification type' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'alert':
        if (!data?.cityName || data?.aqi === undefined) {
          return NextResponse.json(
            { error: 'Missing alert data' },
            { status: 400 }
          );
        }
        success = await sendAirQualityAlert(email, {
          cityName: data.cityName,
          aqi: data.aqi,
          aqiCategory: data.aqiCategory || 'moderate',
          timestamp: data.timestamp || new Date().toISOString(),
          recommendations: data.recommendations || [
            'Pratite kvalitetu zraka',
            'Izbjegavajte dugotrajne aktivnosti vani ako je AQI visok'
          ],
          dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://airquality.app'
        });
        break;

      case 'digest':
        if (!data?.cities || !Array.isArray(data.cities)) {
          return NextResponse.json(
            { error: 'Missing cities data for digest' },
            { status: 400 }
          );
        }
        success = await sendDailyDigest(email, data.cities);
        break;

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
