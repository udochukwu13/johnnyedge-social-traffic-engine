'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState<any>({ totalClicks: 0, byReferrer: [], recentClicks: [] });
  const [domains, setDomains] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('https://johnnyedge-social-traffic-engine.vercel.app/go/my-portfolio');
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    // Fetch leads
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeads(data.leads || []);
      })
      .catch((err) => console.error('Error fetching leads:', err));

    // Fetch analytics
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnalytics(data.analytics);
      })
      .catch((err) => console.error('Error fetching analytics:', err));

    // Fetch custom domains
    fetch('/api/domains?workspaceId=test_workspace_1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDomains(data.domains || []);
      })
      .catch((err) => console.error('Error fetching domains:', err));
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

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'test_workspace_1', domain: newDomain })
      });
      const data = await res.json();
      if (data.success) {
        alert('Domain registered successfully! Please point your CNAME record to cname.vercel-dns.com');
        setDomains([data.customDomain, ...domains]);
        setNewDomain('');
      } else {
        alert(data.error || 'Failed to register domain');
      }
    } catch (err) {
      alert('Error registering domain');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Quick Navigation */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">JohnnyEdge Social Traffic Engine</h1>
            <p className="text-gray-400 text-sm mt-1">Enterprise Creator & Business Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="/analytics" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg"
            >
              📊 View Detailed Analytics &rarr;
            </a>
            <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-4 py-1.5 rounded-full text-xs font-semibold">Pro Active</span>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-gray-400">Total Tracking Clicks</h3>
            <p className="text-4xl font-black text-indigo-400 mt-2">{analytics.totalClicks}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-gray-400">Captured Leads</h3>
            <p className="text-4xl font-black text-emerald-400 mt-2">{leads.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-gray-400">Active Campaigns</h3>
            <p className="text-4xl font-black text-amber-400 mt-2">1</p>
          </div>
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

        {/* Campaign QR Code Generator Section */}
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

        {/* Custom Domain Manager Section (Agency Tier) */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-indigo-300">🌐 Agency Custom Domain Mapping</h2>
            <span className="bg-purple-950 text-purple-300 border border-purple-800/50 px-3 py-1 rounded-full text-xs font-semibold">Agency Tier</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">Map your brand's custom tracking domain (e.g., tr.brandname.com) to replace default Vercel URLs.</p>
          
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                required
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="tr.yourbrand.com"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all"
              >
                Add Domain
              </button>
            </div>
          </form>

          {domains.length > 0 && (
            <div className="mt-4 space-y-2">
              {domains.map((d: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-gray-950 border border-gray-800 p-3 rounded-lg text-sm">
                  <span className="font-mono text-indigo-200">{d.domain}</span>
                  <span className="bg-amber-950 text-amber-400 border border-amber-800/50 px-2.5 py-1 rounded-full text-xs">{d.status}</span>
                </div>
              ))}
            </div>
          )}
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
                {leads.length > 0 ? (
                  leads.map((lead: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 font-medium">{lead.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-300">{lead.email}</td>
                      <td className="py-3 px-4 text-gray-300">{lead.phone || 'N/A'}</td>
                      <td className="py-3 px-4"><span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-full text-xs">{lead.status}</span></td>
                      <td className="py-3 px-4 text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">No leads captured yet.</td>
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