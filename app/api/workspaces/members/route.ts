import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyWorkspaceAccess } from '@/lib/db/rbac';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, targetUserId, role, requesterId } = body;

    // Verify if requester has admin/owner rights
    const hasAccess = await verifyWorkspaceAccess(requesterId, workspaceId, 'admin');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: Insufficient permissions' }, { status: 403 });
    }

    // Insert or update member role
    const result = await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (workspace_id, user_id) 
       DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [workspaceId, targetUserId, role || 'contributor']
    );

    return NextResponse.json({ success: true, member: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Workspace Member API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}