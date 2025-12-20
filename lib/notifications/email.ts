/**
 * Email Notifications Service
 * Send email alerts for air quality changes
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface AlertEmailData {
  cityName: string;
  aqi: number;
  aqiCategory: string;
  timestamp: string;
  recommendations: string[];
  dashboardUrl: string;
}

// Send email using configured provider
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'resend';
  
  switch (provider) {
    case 'resend':
      return sendViaResend(options);
    case 'sendgrid':
      return sendViaSendGrid(options);
    case 'smtp':
      return sendViaSMTP(options);
    default:
      logger.warn('No email provider configured');
      return false;
  }
}

// Resend (recommended for Vercel)
async function sendViaResend(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn('Resend API key not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Air Quality <noreply@airquality.app>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    return response.ok;
  } catch (error) {
    logger.error('Resend error:', error);
    return false;
  }
}

// SendGrid
async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    logger.warn('SendGrid API key not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: process.env.EMAIL_FROM || 'noreply@airquality.app' },
        subject: options.subject,
        content: [
          { type: 'text/plain', value: options.text || '' },
          { type: 'text/html', value: options.html },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    logger.error('SendGrid error:', error);
    return false;
  }
}

// Generic SMTP (for self-hosted)
async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  // In production, use nodemailer
  // This is a placeholder that logs the email
  console.log('SMTP Email:', options);
  return true;
}

// Create HTML email template for alerts
export function createAlertEmailTemplate(data: AlertEmailData): string {
  const aqiColors: Record<string, string> = {
    good: '#22c55e',
    moderate: '#eab308',
    unhealthy: '#f97316',
    'very-unhealthy': '#ef4444',
    hazardous: '#7c3aed',
  };

  const color = aqiColors[data.aqiCategory] || '#6b7280';

  return `
<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upozorenje o kvaliteti zraka</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: ${color}; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">
        ⚠️ Upozorenje o kvaliteti zraka
      </h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 18px; color: #666; margin-bottom: 10px;">
          ${data.cityName}
        </div>
        <div style="font-size: 64px; font-weight: bold; color: ${color};">
          ${data.aqi}
        </div>
        <div style="font-size: 16px; color: #888; text-transform: uppercase;">
          AQI Indeks
        </div>
      </div>
      
      <!-- Recommendations -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px; color: #333;">Preporuke:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          ${data.recommendations.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('')}
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${data.dashboardUrl}" 
           style="display: inline-block; background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Pogledaj detalje
        </a>
      </div>
      
      <!-- Timestamp -->
      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 14px;">
        Vrijeme mjerenja: ${new Date(data.timestamp).toLocaleString('sr-Latn-RS')}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #888; font-size: 12px;">
        Primili ste ovu poruku jer ste se pretplatili na obavijesti o kvaliteti zraka.
        <br>
        <a href="${data.dashboardUrl}/settings" style="color: ${color};">Upravljaj pretplatom</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Create text version for email
export function createAlertEmailText(data: AlertEmailData): string {
  return `
UPOZORENJE O KVALITETI ZRAKA

Lokacija: ${data.cityName}
AQI Indeks: ${data.aqi}
Vrijeme: ${new Date(data.timestamp).toLocaleString('sr-Latn-RS')}

PREPORUKE:
${data.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Pogledajte više na: ${data.dashboardUrl}

---
Ova poruka je automatski generirana.
Za odjavu posjetite: ${data.dashboardUrl}/settings
  `.trim();
}

// Send air quality alert email
export async function sendAirQualityAlert(
  email: string,
  data: AlertEmailData
): Promise<boolean> {
  const html = createAlertEmailTemplate(data);
  const text = createAlertEmailText(data);

  const subject = `⚠️ ${data.cityName}: AQI ${data.aqi} - ${getAQICategoryName(data.aqiCategory)}`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

function getAQICategoryName(category: string): string {
  const names: Record<string, string> = {
    good: 'Dobar',
    moderate: 'Umjeren',
    unhealthy: 'Nezdrav',
    'very-unhealthy': 'Vrlo nezdrav',
    hazardous: 'Opasan',
  };
  return names[category] || category;
}

// Daily digest email
export async function sendDailyDigest(
  email: string,
  cities: Array<{ name: string; aqi: number; category: string }>
): Promise<boolean> {
  const avgAqi = Math.round(cities.reduce((acc, c) => acc + c.aqi, 0) / cities.length);
  
  const html = `
<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px;">
    <h1 style="color: #333; margin: 0 0 20px;">📊 Dnevni pregled kvalitete zraka</h1>
    
    <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 14px; color: #666;">Prosječni AQI danas</div>
      <div style="font-size: 48px; font-weight: bold; color: #0ea5e9;">${avgAqi}</div>
    </div>
    
    <h3 style="color: #333;">Vaši gradovi:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${cities.map(city => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0;">${city.name}</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold;">${city.aqi}</td>
        </tr>
      `).join('')}
    </table>
    
    <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
      Datum: ${new Date().toLocaleDateString('sr-Latn-RS')}
    </p>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `📊 Dnevni AQI pregled - Prosječni AQI: ${avgAqi}`,
    html,
  });
}
