'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingBuilderPage() {
  const [title, setTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [ctaText, setCtaText] = useState('Claim Offer Now');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'test_workspace_1',
          title,
          slug,
          content: { headline, videoUrl, ctaText }
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success! Landing page published at /p/${slug}`);
      } else {
        setMessage(data.error || 'Failed to publish landing page.');
      }
    } catch (err) {
      setMessage('Network error while publishing page.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
          <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-3 py-1 rounded-full text-xs font-semibold">Visual Page Builder</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">Smart Landing Page Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Design high-converting campaign landing pages with video embeds and lead capture forms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Builder Form */}
          <form onSubmit={handlePublish} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-indigo-300">Page Configuration</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Page Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Web Development Masterclass"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. web-masterclass"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Main Headline</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Scale Your Business with AI & Web Apps"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Video Embed URL (YouTube / MP4)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CTA Button Text</label>
              <input
                type="text"
                required
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Publishing Page...' : 'Publish Landing Page'}
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-xs ${message.startsWith('Success') ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300' : 'bg-red-950/40 border border-red-800/50 text-red-300'}`}>
                {message}
              </div>
            )}
          </form>

          {/* Live Preview Pane */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-indigo-300 mb-4">Live Page Preview</h2>
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 space-y-4">
                <h3 className="text-2xl font-black text-white">{headline || 'Your Headline Appears Here'}</h3>
                
                {videoUrl ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center text-xs text-gray-500">
                    [Video Embedded]
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-900 rounded-lg border border-dashed border-gray-800 flex items-center justify-center text-xs text-gray-500">
                    Video preview will load here
                  </div>
                )}

                <button className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm shadow-md">
                  {ctaText}
                </button>
              </div>
            </div>
            <span className="text-xs text-gray-500 text-center mt-4">Responsive mobile and desktop view</span>
          </div>

        </div>

      </div>
    </main>
  );
}