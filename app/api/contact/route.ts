import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  enforceRateLimit,
  requireJsonContentType,
  requireMaxBodySize,
  requireSameOrigin,
} from '@/lib/utils/request-security';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Ime mora imati najmanje 2 karaktera').max(100),
  email: z.string().trim().email('Neispravan email format'),
  message: z.string().trim().min(10, 'Poruka mora imati najmanje 10 karaktera').max(5000),
  website: z.string().trim().max(0).optional(), // honeypot
});

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const sameOriginError = requireSameOrigin(request);
    if (sameOriginError) {
      return sameOriginError;
    }

    const rateLimitError = await enforceRateLimit(request, {
      prefix: 'api:contact',
      limit: RATE_LIMIT,
      windowMs: RATE_LIMIT_WINDOW_MS,
      message: 'Previse zahteva. Pokusajte ponovo za sat vremena.',
    });
    if (rateLimitError) {
      return rateLimitError;
    }

    const maxBodySizeError = requireMaxBodySize(request, 32 * 1024);
    if (maxBodySizeError) {
      return maxBodySizeError;
    }

    const contentTypeError = requireJsonContentType(request);
    if (contentTypeError) {
      return contentTypeError;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Neispravan JSON payload' }, { status: 400 });
    }

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Neispravni podaci',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, message, website } = result.data;

    // Honeypot trap for basic bots
    if (website && website.length > 0) {
      return NextResponse.json({ error: 'Neispravni podaci' }, { status: 400 });
    }

    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');

    let deliveryAttempted = false;
    let deliverySucceeded = false;

    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      deliveryAttempted = true;
      try {
        const discordResponse = await fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: 'Nova poruka sa kontakt forme',
                color: 0x3b82f6,
                fields: [
                  { name: 'Ime', value: name, inline: true },
                  { name: 'Email', value: email, inline: true },
                  { name: 'Poruka', value: message.substring(0, 1024) },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });

        if (discordResponse.ok) {
          deliverySucceeded = true;
        }
      } catch (error) {
        console.error('Discord webhook error:', error);
      }
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;
    if (resendApiKey && contactEmail) {
      deliveryAttempted = true;
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Kontakt Forma <noreply@yourdomain.com>',
            to: contactEmail,
            subject: `Nova poruka od ${name}`,
            html: `
              <h2>Nova poruka sa kontakt forme</h2>
              <p><strong>Ime:</strong> ${escapedName}</p>
              <p><strong>Email:</strong> ${escapedEmail}</p>
              <p><strong>Poruka:</strong></p>
              <p>${escapedMessage}</p>
            `,
            reply_to: email,
          }),
        });

        if (resendResponse.ok) {
          deliverySucceeded = true;
        }
      } catch (error) {
        console.error('Resend error:', error);
      }
    }

    if (deliveryAttempted && !deliverySucceeded) {
      return NextResponse.json(
        { error: 'Doslo je do greske pri slanju poruke. Pokusajte ponovo.' },
        { status: 502 }
      );
    }

    console.log('Contact form submission:', {
      name,
      email,
      messageLength: message.length,
      deliveryAttempted,
      deliverySucceeded,
    });

    return NextResponse.json({
      success: true,
      message: 'Poruka je uspesno poslata',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Doslo je do greske pri slanju poruke. Pokusajte ponovo.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
