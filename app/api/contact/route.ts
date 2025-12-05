import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validaciona šema za kontakt formu
const contactSchema = z.object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(100),
  email: z.string().email('Neispravan email format'),
  message: z.string().min(10, 'Poruka mora imati najmanje 10 karaktera').max(5000),
});

// Rate limiting - jednostavna implementacija
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // maksimalno 5 poruka
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // po satu

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }
  
  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Dobavi IP za rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      ?? request.headers.get('x-real-ip') 
      ?? 'unknown';
    
    // Proveri rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Previše zahteva. Pokušajte ponovo za sat vremena.' },
        { status: 429 }
      );
    }
    
    // Parsiraj telo zahteva
    const body = await request.json();
    
    // Validiraj podatke
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Neispravni podaci', 
          details: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { name, email, message } = result.data;
    
    // Ovde možete dodati različite metode slanja:
    // 1. Email putem Resend, SendGrid, Nodemailer, itd.
    // 2. Sačuvati u bazu podataka
    // 3. Poslati na Discord/Slack webhook
    // 4. Integrisati sa FormSpree, Netlify Forms, itd.
    
    // Primer: Slanje na Discord webhook (ako je konfigurisan)
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '📬 Nova poruka sa kontakt forme',
            color: 0x3B82F6,
            fields: [
              { name: '👤 Ime', value: name, inline: true },
              { name: '📧 Email', value: email, inline: true },
              { name: '💬 Poruka', value: message.substring(0, 1024) },
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      });
    }
    
    // Primer: Slanje emaila putem Resend (ako je konfigurisan)
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;
    if (resendApiKey && contactEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Kontakt Forma <noreply@yourdomain.com>',
          to: contactEmail,
          subject: `Nova poruka od ${name}`,
          html: `
            <h2>Nova poruka sa kontakt forme</h2>
            <p><strong>Ime:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Poruka:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
          reply_to: email,
        }),
      });
    }
    
    // Log za development
    console.log('Contact form submission:', { name, email, messageLength: message.length });
    
    return NextResponse.json({
      success: true,
      message: 'Poruka je uspešno poslata',
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { error: 'Došlo je do greške pri slanju poruke. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}

// Ne dozvoljavamo GET metodu
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
