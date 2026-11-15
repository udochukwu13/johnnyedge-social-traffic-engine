import { pool } from '@/lib/db';

export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'analyst' | 'contributor';

const roleHierarchy: Record<WorkspaceRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  analyst: 2,
  contributor: 1,
};

export async function verifyWorkspaceAccess(userId: string, workspaceId: string, requiredRole: WorkspaceRole = 'contributor'): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT role FROM workspace_members WHERE user_id = $1 AND workspace_id = $2`,
      [userId, workspaceId]
    );

    if (result.rows.length === 0) return false;

    const userRole = result.rows[0].role as WorkspaceRole;
    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
  } catch (error) {
    console.error('RBAC Verification Error:', error);
    return false;
  }
}