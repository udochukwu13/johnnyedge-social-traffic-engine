import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { nanoid } from "nanoid";
import { checkWorkspaceEntitlement } from "@/lib/entitlements";
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { workspaceId, campaignId, destinationUrl, utmSource, utmMedium, utmCampaign, utmContent } = body;

    if (!workspaceId || !destinationUrl) {
      return NextResponse.json({ error: "Missing required fields: workspaceId or destinationUrl" }, { status: 400 });
    }

    // 1. Enforce subscription tier entitlements
    const entitlement = await checkWorkspaceEntitlement(workspaceId, "links_created");
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.error }, { status: 403 });
    }

    await client.query("BEGIN");

    // 2. Generate unique friendly tracking slug
    const slug = `go/${nanoid(8)}`;

    const insertQuery = `
      INSERT INTO tracking_links 
      (workspace_id, campaign_id, slug, destination_url, utm_source, utm_medium, utm_campaign, utm_content, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING *;
    `;

    const values = [
      workspaceId,
      campaignId || null,
      slug,
      destinationUrl,
      utmSource || null,
      utmMedium || null,
      utmCampaign || null,
      utmContent || null,
    ];

    const result = await client.query(insertQuery, values);
    const newLink = result.rows[0];

    // 3. Increment workspace link usage counter
    await client.query(
      `INSERT INTO workspace_usage (workspace_id, links_created) 
       VALUES ($1, 1) 
       ON CONFLICT (workspace_id) 
       DO UPDATE SET links_created = workspace_usage.links_created + 1, updated_at = CURRENT_TIMESTAMP`,
      [workspaceId]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      data: {
        ...newLink,
        fullTrackingUrl: `https://${process.env.NEXT_PUBLIC_DOMAIN || "johnnyedgelimited.com"}/${newLink.slug}`,
      },
    }, { status: 201 });

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error creating tracking link:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}