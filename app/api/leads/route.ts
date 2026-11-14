import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Fetch all leads for a specific workspace
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId parameter" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM leads WHERE workspace_id = $1 ORDER BY created_at DESC`,
      [workspaceId]
    );
    return NextResponse.json({ success: true, data: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// POST: Capture and ingest new leads (existing functionality)
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const {
      workspaceId,
      campaignId,
      trackingLinkId,
      name,
      email,
      phone,
      businessName,
      leadSource,
    } = body;

    if (!workspaceId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: workspaceId or email" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const duplicateCheck = await client.query(
      `SELECT id, pipeline_stage FROM leads WHERE workspace_id = $1 AND email = $2 LIMIT 1`,
      [workspaceId, email]
    );

    let leadRecord;

    if (duplicateCheck.rows.length > 0) {
      const existingLeadId = duplicateCheck.rows[0].id;
      const updateResult = await client.query(
        `UPDATE leads 
         SET name = COALESCE($1, name), 
             phone = COALESCE($2, phone), 
             business_name = COALESCE($3, business_name),
             lead_source = COALESCE($4, lead_source)
         WHERE id = $5 
         RETURNING *;`,
        [name, phone, businessName, leadSource, existingLeadId]
      );
      leadRecord = updateResult.rows[0];
    } else {
      const insertResult = await client.query(
        `INSERT INTO leads 
         (workspace_id, campaign_id, tracking_link_id, name, email, phone, business_name, pipeline_stage, lead_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8)
         RETURNING *;`,
        [
          workspaceId,
          campaignId || null,
          trackingLinkId || null,
          name || "Anonymous Lead",
          email,
          phone || null,
          businessName || null,
          leadSource || "Direct Landing Page",
        ]
      );
      leadRecord = insertResult.rows[0];
    }

    if (campaignId) {
      await client.query(
        `INSERT INTO conversion_events (workspace_id, campaign_id, event_type, lead_id, revenue_amount)
         VALUES ($1, $2, 'lead_capture', $3, 0.00)`,
        [workspaceId, campaignId, leadRecord.id]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Lead successfully captured and assigned to CRM pipeline.",
        data: leadRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Lead capture processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}