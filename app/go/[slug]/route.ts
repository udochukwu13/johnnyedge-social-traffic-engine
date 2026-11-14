import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.redirect(new URL("/404", request.url));
  }

  const client = await pool.connect();
  try {
    // 1. Fetch tracking link by slug
    const fullSlug = `go/${slug}`;
    const linkResult = await client.query(
      `SELECT * FROM tracking_links WHERE slug = $1 AND is_active = TRUE LIMIT 1`,
      [fullSlug]
    );

    if (linkResult.rows.length === 0) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    const link = linkResult.rows[0];

    // 2. Bot detection heuristics
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /bot|crawler|spider|crawling|lighthouse|preview/i.test(userAgent);

    if (!isBot) {
      // Safely extract client IP from headers (grabbing the first comma-separated IP string)[cite: 2]
      const forwardedFor = request.headers.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || "unknown");
      const referrer = request.headers.get("referer") || "direct";

      // 3. Asynchronously record click analytics and increment counter
      await client.query(
        `INSERT INTO link_clicks (tracking_link_id, workspace_id, campaign_id, ip_address, user_agent, referrer)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [link.id, link.workspace_id, link.campaign_id, ip, userAgent, referrer]
      );

      await client.query(
        `UPDATE tracking_links SET clicks_count = clicks_count + 1 WHERE id = $1`,
        [link.id]
      );
    }

    // 4. Construct destination URL and append UTM parameters
    const destinationUrl = new URL(link.destination_url);
    if (link.utm_source) destinationUrl.searchParams.set("utm_source", link.utm_source);
    if (link.utm_medium) destinationUrl.searchParams.set("utm_medium", link.utm_medium);
    if (link.utm_campaign) destinationUrl.searchParams.set("utm_campaign", link.utm_campaign);
    if (link.utm_content) destinationUrl.searchParams.set("utm_content", link.utm_content);

    // 5. Execute high-speed 302 temporary redirect
    return NextResponse.redirect(destinationUrl.toString(), { status: 302 });

  } catch (error: any) {
    console.error("Redirect processing error:", error);
    return NextResponse.redirect(new URL("/500", request.url));
  } finally {
    client.release();
  }
}