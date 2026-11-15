import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET: Fetch custom domains for a workspace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'test_workspace_1';

    const result = await pool.query(
      `SELECT * FROM custom_domains WHERE workspace_id = $1 ORDER BY created_at DESC`,
      [workspaceId]
    );

    return NextResponse.json({ success: true, domains: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Domains Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Register a new custom domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, domain } = body;

    if (!workspaceId || !domain) {
      return NextResponse.json({ error: 'workspaceId and domain are required' }, { status: 400 });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '');

    const result = await pool.query(
      `INSERT INTO custom_domains (workspace_id, domain, status, created_at)
       VALUES ($1, $2, 'pending_dns', NOW())
       RETURNING *`,
      [workspaceId, cleanDomain]
    );

    return NextResponse.json({ success: true, customDomain: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Register Domain Error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Domain already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}