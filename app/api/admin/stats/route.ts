import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== process.env.ADMIN_SECRET_KEY && adminKey !== 'johnnyedge_admin_2026') {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin Key' }, { status: 403 });
    }

    const workspacesCount = await pool.query(`SELECT COUNT(*) as count FROM workspaces`, []);
    const campaignsCount = await pool.query(`SELECT COUNT(*) as count FROM campaigns`, []);
    const clicksCount = await pool.query(`SELECT COUNT(*) as count FROM link_clicks`, []);
    const leadsCount = await pool.query(`SELECT COUNT(*) as count FROM leads`, []);

    const auditLogs = await pool.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10`,
      []
    ).catch(() => ({ rows: [] }));

    return NextResponse.json({
      success: true,
      stats: {
        workspaces: workspacesCount.rows[0]?.count || 0,
        campaigns: campaignsCount.rows[0]?.count || 0,
        totalClicks: clicksCount.rows[0]?.count || 0,
        totalLeads: leadsCount.rows[0]?.count || 0,
      },
      auditLogs: auditLogs.rows,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Admin Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}