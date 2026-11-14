import { pool } from "@/lib/db";

export interface PlanFeatures {
  max_tracking_links: number;
  max_landing_pages: number;
  team_management: boolean;
  client_workspaces: boolean;
  white_label: boolean | string;
  ai_queries_per_month: number;
  crm_access: "basic" | "full" | "multi_client";
}

export async function checkWorkspaceEntitlement(
  workspaceId: string,
  metricToCheck: "links_created" | "landing_pages_created" | "ai_queries_used"
): Promise<{ allowed: boolean; error?: string }> {
  const client = await pool.connect();
  try {
    // 1. Get organization subscription plan features
    const planResult = await client.query(
      `SELECT sp.features 
       FROM workspaces w
       JOIN organizations o ON w.organization_id = o.id
       JOIN subscriptions s ON o.id = s.organization_id
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE w.id = $1 AND s.status = 'active'
       LIMIT 1;`,
      [workspaceId]
    );

    if (planResult.rows.length === 0) {
      return { allowed: false, error: "No active subscription found for this workspace." };
    }

    const features: PlanFeatures = planResult.rows[0].features;

    // 2. Get current usage
    const usageResult = await client.query(
      `SELECT links_created, landing_pages_created, ai_queries_used 
       FROM workspace_usage WHERE workspace_id = $1`,
      [workspaceId]
    );

    const usage = usageResult.rows[0] || { links_created: 0, landing_pages_created: 0, ai_queries_used: 0 };

    // 3. Evaluate limits
    if (metricToCheck === "links_created" && usage.links_created >= features.max_tracking_links) {
      return { allowed: false, error: `Tracking link limit reached (${features.max_tracking_links}) for your current edition. Please upgrade your plan.` };
    }
    if (metricToCheck === "landing_pages_created" && usage.landing_pages_created >= features.max_landing_pages) {
      return { allowed: false, error: `Landing page limit reached (${features.max_landing_pages}) for your current edition. Please upgrade your plan.` };
    }
    if (metricToCheck === "ai_queries_used" && usage.ai_queries_used >= features.ai_queries_per_month) {
      return { allowed: false, error: `AI Assistant monthly query quota reached (${features.ai_queries_per_month}). Upgrade to Business or Agency edition for higher limits.` };
    }

    return { allowed: true };
  } catch (error: any) {
    console.error("Entitlement check error:", error);
    return { allowed: false, error: "Internal validation error." };
  } finally {
    client.release();
  }
}