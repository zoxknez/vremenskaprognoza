import { NextRequest, NextResponse } from 'next/server';
import { 
  storeSubscription, 
  removeSubscription, 
  sendPushNotification,
  createAlertPayload
} from '@/lib/notifications/push';

// Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, userId, preferences } = body;

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: 'Missing subscription or userId' },
        { status: 400 }
      );
    }

    // Store subscription
    storeSubscription(userId, subscription);

    // Send welcome notification
    await sendPushNotification(
      subscription,
      createAlertPayload('daily_summary', {
        cityName: 'Vaš region',
        message: 'Uspješno ste se pretplatili na obavijesti o kvaliteti zraka!'
      })
    );

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
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

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
