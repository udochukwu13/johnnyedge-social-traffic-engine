import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/db';

// POST: Create/Publish a new landing page
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { userId, title, slug, content, theme } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const pageUserId = userId || 'default_user';
    const pageTheme = theme || 'modern';

    // Insert landing page into Neon PostgreSQL database
    const result = await db.query(
      `INSERT INTO landing_pages (user_id, title, slug, content, theme, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [pageUserId, title, slug, content || {}, pageTheme]
    );

    return NextResponse.json({ 
      success: true, 
      landingPage: result.rows[0] 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Landing Pages API Error:', error);
    // Handle unique slug constraint violation gracefully
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Landing page slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Fetch landing pages for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default_user';

    const result = await db.query(
      `SELECT * FROM landing_pages WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ 
      success: true, 
      landingPages: result.rows 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch Landing Pages Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}