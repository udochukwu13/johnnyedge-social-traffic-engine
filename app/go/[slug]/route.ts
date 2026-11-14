import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch tracking link from Neon PostgreSQL
    const linkResult = await db.query(
      'SELECT * FROM tracking_links WHERE slug = $1 LIMIT 1',
      [slug]
    );

    if (linkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Tracking link not found' }, { status: 404 });
    }

    const link = linkResult.rows[0];

    // Basic bot filtering user-agent check
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|crawl|slurp|spider|lighthouse/i.test(userAgent);

    if (!isBot) {
      // Parse IP and country from Vercel headers safely
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
      const country = request.headers.get('x-vercel-ip-country') || 'NG';

      await db.query(
        `INSERT INTO link_clicks (link_id, ip_address, country, user_agent, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [link.id, ip, country, userAgent]
      );

      // Increment click counter
      await db.query(
        'UPDATE tracking_links SET clicks = clicks + 1 WHERE id = $1',
        [link.id]
      );
    }

    // Perform HTTP 302 redirect to destination URL
    return NextResponse.redirect(link.destination_url, { status: 302 });
  } catch (error: any) {
    console.error('Redirect Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}