'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnalyticsDeepDivePage() {
  const [analytics, setAnalytics] = useState<any>({ totalClicks: 0, byReferrer: [], recentClicks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalytics(data.analytics);
        }
      })
      .catch((err) => console.error('Error fetching deep analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
          <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-3 py-1 rounded-full text-xs font-semibold">Deep Analytics</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">Detailed Traffic Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Granular breakdown of click sources, referrers, and visitor interaction logs.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-gray-400">Total Redirect Clicks Recorded</h3>
            <p className="text-5xl font-black text-indigo-400 mt-3">{loading ? '...' : analytics.totalClicks}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-gray-400">Top Traffic Source</h3>
            <p className="text-2xl font-bold text-emerald-400 mt-3">{loading ? '...' : (analytics.byReferrer?.[0]?.source || 'Direct / Unknown')}</p>
          </div>
        </div>

        {/* Referrer Breakdown Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-indigo-300">📊 Traffic by Referrer Source</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-3 px-4">Referrer Source</th>
                  <th className="py-3 px-4 text-right">Click Count</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500">Loading analytics data...</td>
                  </tr>
                ) : analytics.byReferrer?.length > 0 ? (
                  analytics.byReferrer.map((ref: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 font-medium text-indigo-200">{ref.source}</td>
                      <td className="py-3 px-4 text-right font-mono text-indigo-400">{ref.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500">No referrer data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Click Logs Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-indigo-300">🕒 Recent Visitor Click Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-3 px-4">Slug / Link</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Referrer</th>
                  <th className="py-3 px-4">Clicked At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">Loading click logs...</td>
                  </tr>
                ) : analytics.recentClicks?.length > 0 ? (
                  analytics.recentClicks.map((click: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 font-mono text-indigo-300">/go/{click.slug}</td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-xs">{click.ip_address || '127.0.0.1'}</td>
                      <td className="py-3 px-4 text-gray-300">{click.referrer || 'Direct'}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{new Date(click.clicked_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">No click logs recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}