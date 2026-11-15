'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({ workspaces: 0, campaigns: 0, totalClicks: 0, totalLeads: 0 });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('johnnyedge_admin_2026');
  const [authorized, setAuthorized] = useState(true);

  const fetchAdminData = (key: string) => {
    setLoading(true);
    fetch(`/api/admin/stats?key=${key}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setAuditLogs(data.auditLogs || []);
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch((err) => console.error('Error fetching admin stats:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData(adminKey);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm font-medium">
            &larr; Back to Creator Dashboard
          </Link>
          <span className="bg-red-950 text-red-400 border border-red-800/50 px-3 py-1 rounded-full text-xs font-semibold">Super-Admin Control Console</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-red-400">Platform Control & Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">System-wide oversight of workspaces, traffic volume, telemetry, and security audit logs.</p>
        </div>

        {!authorized ? (
          <div className="bg-red-950/30 border border-red-800/50 p-6 rounded-xl text-center space-y-4">
            <h2 className="text-xl font-bold text-red-300">Access Restricted</h2>
            <p className="text-sm text-gray-300">Please provide a valid administrator security key to access the control console.</p>
            <div className="flex justify-center gap-3 max-w-md mx-auto">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white flex-1"
                placeholder="Enter admin key..."
              />
              <button
                onClick={() => fetchAdminData(adminKey)}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              >
                Authenticate
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* System Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-sm font-medium text-gray-400">Total Workspaces</h3>
                <p className="text-4xl font-black text-indigo-400 mt-2">{loading ? '...' : stats.workspaces}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-sm font-medium text-gray-400">Active Campaigns</h3>
                <p className="text-4xl font-black text-amber-400 mt-2">{loading ? '...' : stats.campaigns}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-sm font-medium text-gray-400">Total Redirect Clicks</h3>
                <p className="text-4xl font-black text-emerald-400 mt-2">{loading ? '...' : stats.totalClicks}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-sm font-medium text-gray-400">Global Leads Captured</h3>
                <p className="text-4xl font-black text-purple-400 mt-2">{loading ? '...' : stats.totalLeads}</p>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-red-300">🛡️ System Security & Audit Logs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-3 px-4">Event Action</th>
                      <th className="py-3 px-4">Workspace ID</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">Loading audit logs...</td>
                      </tr>
                    ) : auditLogs.length > 0 ? (
                      auditLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4 font-semibold text-white">{log.action}</td>
                          <td className="py-3 px-4 font-mono text-indigo-300">{log.workspace_id || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-300">{log.details || 'Standard telemetry'}</td>
                          <td className="py-3 px-4 text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">No security audit logs recorded yet. System operational.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}