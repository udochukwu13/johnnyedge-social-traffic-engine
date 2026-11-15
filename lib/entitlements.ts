import { pool } from '@/lib/db';

export async function checkWorkspaceEntitlement(workspaceId: string, featureKey: string) {
  try {
    // Fetch active subscription for the workspace
    const subResult = await pool.query(
      `SELECT * FROM subscriptions WHERE workspace_id = $1 AND status = 'active'`,
      [workspaceId]
    );

    if (subResult.rows.length === 0) {
      return { allowed: false, error: 'Internal validation error.' };
    }

    const subscription = subResult.rows[0];

    // Optional: Check usage limits if applicable (e.g., ai_queries_used)
    if (featureKey === 'ai_queries_used') {
      const usageResult = await pool.query(
        `SELECT ai_queries_used FROM workspace_usage WHERE workspace_id = $1`,
        [workspaceId]
      );
      const used = usageResult.rows[0]?.ai_queries_used || 0;
      
      // Pro plan limit (e.g., 1000 queries)
      if (subscription.plan_type === 'pro' && used >= 1000) {
        return { allowed: false, error: 'AI query limit reached for your Pro plan.' };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('Entitlement check error:', error);
    return { allowed: false, error: 'Internal validation error.' };
  }
}