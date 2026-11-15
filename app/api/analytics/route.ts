
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId =
      request.nextUrl.searchParams.get('userId') ||
      'test_user_1';

    // 1. Total clicks
    const summaryResult = await pool.query(
      `SELECT COUNT(*) AS total_clicks
       FROM link_clicks tc
       INNER JOIN tracking_links tl
         ON tc.link_id = tl.id
       WHERE tl.user_id = $1`,
      [userId]
    );

    // 2. Clicks grouped by country
    const countryResult = await pool.query(
      `SELECT
         COALESCE(NULLIF(tc.country, ''), 'Unknown') AS source,
         COUNT(*) AS count
       FROM link_clicks tc
       INNER JOIN tracking_links tl
         ON tc.link_id = tl.id
       WHERE tl.user_id = $1
       GROUP BY tc.country
       ORDER BY count DESC
       LIMIT 10`,
      [userId]
    );

    // 3. Recent click activity
    const recentClicksResult = await pool.query(
      `SELECT
         tc.id,
         tl.slug,
         tc.ip_address,
         tc.user_agent,
         tc.country,
         tc.created_at
       FROM link_clicks tc
       INNER JOIN tracking_links tl
         ON tc.link_id = tl.id
       WHERE tl.user_id = $1
       ORDER BY tc.created_at DESC
       LIMIT 10`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      analytics: {
        totalClicks: Number(
          summaryResult.rows[0]?.total_clicks || 0
        ),
        byReferrer: countryResult.rows,
        recentClicks: recentClicksResult.rows,
      },
    });

  } catch (error) {
    console.error('Analytics API Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to load analytics data.',
        analytics: {
          totalClicks: 0,
          byReferrer: [],
          recentClicks: [],
        },
      },
      { status: 500 }
    );
  }
}
