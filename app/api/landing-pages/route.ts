import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { nanoid } from "nanoid";
import { checkWorkspaceEntitlement } from "@/lib/entitlements";

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { workspaceId, campaignId, title, themeConfig, blocks } = body;

    if (!workspaceId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: workspaceId or title" },
        { status: 400 }
      );
    }

    // 1. Enforce subscription tier entitlements
    const entitlement = await checkWorkspaceEntitlement(workspaceId, "landing_pages_created");
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.error }, { status: 403 });
    }

    await client.query("BEGIN");

    const slug = nanoid(10).toLowerCase();

    const insertQuery = `
      INSERT INTO landing_pages (workspace_id, campaign_id, title, slug, status, theme_config, blocks)
      VALUES ($1, $2, $3, $4, 'published', $5, $6)
      RETURNING *;
    `;

    const values = [
      workspaceId,
      campaignId || null,
      title,
      slug,
      JSON.stringify(themeConfig || {}),
      JSON.stringify(blocks || []),
    ];

    const result = await client.query(insertQuery, values);
    const newPage = result.rows[0];

    // 2. Increment workspace landing page usage counter
    await client.query(
      `INSERT INTO workspace_usage (workspace_id, landing_pages_created) 
       VALUES ($1, 1) 
       ON CONFLICT (workspace_id) 
       DO UPDATE SET landing_pages_created = workspace_usage.landing_pages_created + 1, updated_at = CURRENT_TIMESTAMP`,
      [workspaceId]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newPage,
          publicUrl: `https://${process.env.NEXT_PUBLIC_DOMAIN || "johnnyedgelimited.com"}/p/${newPage.slug}`,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error creating landing page:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}