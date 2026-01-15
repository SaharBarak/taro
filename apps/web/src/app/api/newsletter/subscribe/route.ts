import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

// Rate limiting: store timestamps per IP (in production use Redis)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter out timestamps outside the window
  const recentTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  // Add current timestamp
  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);

  return false;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email to the newsletter via Beehiiv
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 'unknown';

    // Rate limiting check
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { message: 'יותר מדי בקשות. נסו שוב מאוחר יותר.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'נא להזין כתובת אימייל' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return NextResponse.json(
        { message: 'נא להזין כתובת אימייל תקינה' },
        { status: 400 }
      );
    }

    // Check Beehiiv configuration
    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error('Beehiiv credentials not configured');
      return NextResponse.json(
        { message: 'שגיאת תצורה. אנא נסו שוב מאוחר יותר.' },
        { status: 500 }
      );
    }

    // Subscribe via Beehiiv
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email: trimmedEmail,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'website_homepage',
          utm_medium: 'website',
          utm_campaign: 'newsletter_section',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Check if already subscribed
      if (response.status === 409 || data?.message?.includes('already')) {
        return NextResponse.json(
          { message: 'כתובת האימייל כבר רשומה לעדכונים' },
          { status: 409 }
        );
      }
      console.error('Beehiiv API error:', data);
      throw new Error('Failed to subscribe to newsletter');
    }

    return NextResponse.json(
      { message: 'נרשמתם בהצלחה לעדכונים!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { message: 'שגיאה בהרשמה. נסו שוב מאוחר יותר.' },
      { status: 500 }
    );
  }
}
