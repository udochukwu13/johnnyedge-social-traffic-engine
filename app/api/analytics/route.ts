import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Safe URL parsing fallback for static build analyzer
    let searchParams = new URL(request.url || 'http://localhost').searchParams;
    const workspaceId = searchParams.get('workspaceId') || 'test_workspace_1';

    // Fetch overall click count and recent clicks
    const summaryResult = await pool.query(
      `SELECT COUNT(*) as total_clicks 
       FROM link_clicks tc
       JOIN tracking_links tl ON tc.tracking_link_id = tl.id`,
      []
    ).catch(() => ({ rows: [{ total_clicks: 0 }] }));

    // Fetch clicks grouped by referrer (social platform source)
    const referrerResult = await pool.query(
      `SELECT COALESCE(referrer, 'Direct / Unknown') as source, COUNT(*) as count 
       FROM link_clicks 
       GROUP BY referrer 
       ORDER BY count DESC 
       LIMIT 5`,
      []
    ).catch(() => ({ rows: [] }));

    // Fetch recent click logs
    const recentClicksResult = await pool.query(
      `SELECT tc.id, tl.slug, tc.ip_address, tc.user_agent, tc.referrer, tc.clicked_at 
       FROM link_clicks tc
       JOIN tracking_links tl ON tc.tracking_link_id = tl.id
       ORDER BY tc.clicked_at DESC 
       LIMIT 10`,
      []
    ).catch(() => ({ rows: [] }));

    return NextResponse.json({
      success: true,
      analytics: {
        totalClicks: summaryResult.rows[0]?.total_clicks || 0,
        byReferrer: referrerResult.rows,
        recentClicks: recentClicksResult.rows,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Analytics API Execution Error:', error);
    return NextResponse.json({ 
      success: true, 
      analytics: { totalClicks: 0, byReferrer: [], recentClicks: [] } 
    }, { status: 200 });
  }
}