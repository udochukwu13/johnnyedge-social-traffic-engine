import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon to use WebSocket connection for serverless/Edge compatibility
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined.");
}

export const pool = new Pool({ connectionString });

/**
 * Helper to execute queries with automatic client release and workspace RLS context setting.
 */
export async function queryWithWorkspace<T>(
  workspaceId: string,
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Set PostgreSQL session variable for Row-Level Security (RLS)
    await client.query(`SELECT set_config('app.current_workspace_id', $1, true)`, [workspaceId]);
    
    const result = await client.query(queryText, params);
    await client.query("COMMIT");
    return result.rows as T[];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}