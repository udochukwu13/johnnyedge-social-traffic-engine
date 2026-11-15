'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CampaignBuilderPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage('');

    try {
      const res = await fetch('/api/landing-pages', { // or your tracking link creation endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'test_workspace_1',
          title,
          slug,
          targetUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultMessage(`Success! Campaign tracking link created: /go/${slug}`);
        setTitle('');
        setSlug('');
        setTargetUrl('');
      } else {
        setResultMessage(data.error || 'Failed to create campaign.');
      }
    } catch (err) {
      setResultMessage('Network error while creating campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
          <span className="bg-amber-950 text-amber-400 border border-amber-800/50 px-3 py-1 rounded-full text-xs font-semibold">Campaign Creator</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">Create New Campaign</h1>
          <p className="text-gray-400 text-sm mt-1">Set up a high-speed tracking link and destination URL for your social media traffic.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateCampaign} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. TikTok Summer Promo 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Custom URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. summer-promo"
            />
            <span className="text-xs text-gray-500 mt-1 block">Your link will be: https://johnnyedge-social-traffic-engine.vercel.app/go/your-slug</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Destination URL</label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="https://yourwebsite.com/landing-page"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing Campaign...' : 'Publish Tracking Campaign'}
          </button>

          {resultMessage && (
            <div className={`p-4 rounded-lg text-sm ${resultMessage.startsWith('Success') ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300' : 'bg-red-950/40 border border-red-800/50 text-red-300'}`}>
              {resultMessage}
            </div>
          )}
        </form>

      </div>
    </main>
  );
}