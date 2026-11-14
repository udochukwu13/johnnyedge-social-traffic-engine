import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { userId, name, email, phone, status } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const leadUserId = userId || 'default_user';
    const leadStatus = status || 'New';

    // Insert lead into Neon PostgreSQL database
    const result = await db.query(
      `INSERT INTO leads (user_id, name, email, phone, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [leadUserId, name || null, email, phone || null, leadStatus]
    );

    return NextResponse.json({ 
      success: true, 
      lead: result.rows[0] 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Leads API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}