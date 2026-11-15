import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/db';

// POST: Capture new lead and trigger optional email notification
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { userId, name, email, phone, status } = body;

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

    const newLead = result.rows[0];

    // Optional: Trigger Resend Email Notification if API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'JohnnyEdge Traffic Engine <onboarding@resend.dev>',
            to: process.env.NOTIFICATION_EMAIL || 'johnudochukwu13@gmail.com',
            subject: '🚀 New Lead Captured!',
            html: `<p>You have a new lead:</p><ul><li><b>Name:</b> ${name || 'N/A'}</li><li><b>Email:</b> ${email}</li><li><b>Phone:</b> ${phone || 'N/A'}</li></ul>`
          })
        });
      } catch (emailErr) {
        console.error('Resend notification error:', emailErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      lead: newLead 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Leads API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// GET: Fetch leads for dashboard display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let result;
    if (userId) {
      result = await db.query(
        `SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      // Return all leads if no specific userId filter is provided
      result = await db.query(
        `SELECT * FROM leads ORDER BY created_at DESC`,
        []
      );
    }

    return NextResponse.json({ 
      success: true, 
      leads: result.rows 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch Leads Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}