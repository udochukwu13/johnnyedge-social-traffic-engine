import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET: Fetch videos and their performance attribution for a workspace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'test_workspace_1';

    const result = await pool.query(
      `SELECT * FROM videos WHERE workspace_id = $1 ORDER BY publication_date DESC`,
      [workspaceId]
    );

    return NextResponse.json({ success: true, videos: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Videos Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST: Register a new social media video attribution record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, title, platform, originalUrl, trackingUrl, destinationUrl, views, conversions } = body;

    if (!workspaceId || !title || !platform || !originalUrl) {
      return NextResponse.json({ error: 'workspaceId, title, platform, and originalUrl are required' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO videos (workspace_id, title, platform, original_url, tracking_url, destination_url, views, conversions, publication_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        workspaceId,
        title,
        platform,
        originalUrl,
        trackingUrl || null,
        destinationUrl || null,
        views || 0,
        conversions || 0,
      ]
    );

    return NextResponse.json({ success: true, video: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create Video Attribution Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}