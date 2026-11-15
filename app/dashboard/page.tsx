'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('https://johnnyedge-social-traffic-engine.vercel.app/go/my-portfolio');

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeads(data.leads || []);
      })
      .catch((err) => console.error('Error fetching leads:', err));
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'test_workspace_1', prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.data.recommendation);
      } else {
        setAiResponse(data.error || 'Failed to get recommendation.');
      }
    } catch (err) {
      setAiResponse('Network error connecting to AI engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">JohnnyEdge Social Traffic Engine</h1>
            <p className="text-gray-400 text-sm mt-1">Enterprise Creator & Business Dashboard</p>
          </div>
          <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-4 py-1.5 rounded-full text-xs font-semibold">Pro Active</span>
        </div>

        {/* AI Marketing Assistant Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-3 text-indigo-300">🤖 AI Marketing Intelligence</h2>
          <form onSubmit={handleAskAI} className="space-y-4">
            <textarea
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              rows={3}
              placeholder="Ask AI how to optimize your campaign ROI or increase conversion rates..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing Campaign Data...' : 'Generate AI Strategy'}
            </button>
          </form>

          {aiResponse && (
            <div className="mt-4 bg-indigo-950/30 border border-indigo-800/40 rounded-lg p-4 text-sm text-indigo-200">
              <strong className="block text-indigo-300 mb-1">AI Recommendation:</strong>
              {aiResponse}
            </div>
          )}
        </div>

        {/* QR Code Generator Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-3 text-indigo-300">📱 Campaign QR Code Generator</h2>
          <p className="text-sm text-gray-400 mb-4">Generate instant scannable QR codes for Instagram Stories, TikTok overlays, and physical flyers.</p>
          
          <div className="space-y-4">
            <input
              type="text"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="Enter tracking link URL..."
            />

            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg w-48 mx-auto shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`}
                alt="Tracking Link QR Code"
                className="w-36 h-36 object-contain"
              />
              <span className="text-xs text-gray-600 mt-2 font-medium">Scan to test traffic</span>
            </div>
          </div>
        </div>

        {/* CRM Leads Table Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-indigo-300">📋 Inbound CRM Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 px-4 font-medium">Sarah Connor</td>
                  <td className="py-3 px-4 text-gray-300">sarah@example.com</td>
                  <td className="py-3 px-4 text-gray-300">+2348012345678</td>
                  <td className="py-3 px-4"><span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-full text-xs">New</span></td>
                  <td className="py-3 px-4 text-gray-400">2026-11-14</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}