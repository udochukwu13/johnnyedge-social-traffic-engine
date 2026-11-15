'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VideoAttributionPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [originalUrl, setOriginalUrl] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [views, setViews] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchVideos = () => {
    fetch('/api/videos?workspaceId=test_workspace_1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setVideos(data.videos || []);
      })
      .catch((err) => console.error('Error fetching videos:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'test_workspace_1',
          title,
          platform,
          originalUrl,
          destinationUrl,
          views: Number(views),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Success! Video attribution record saved.');
        setTitle('');
        setOriginalUrl('');
        setDestinationUrl('');
        setViews(0);
        fetchVideos();
      } else {
        setMessage(data.error || 'Failed to save video record.');
      }
    } catch (err) {
      setMessage('Network error saving video.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full text-xs font-semibold">Video Attribution Engine</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400">Social Media Video Attribution</h1>
          <p className="text-gray-400 text-sm mt-1">Associate individual TikTok, Instagram, and YouTube videos with tracking destinations and performance stats.</p>
        </div>

        {/* Add Video Form */}
        <form onSubmit={handleAddVideo} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-indigo-300 mb-2">Register New Content</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Video Title / Caption</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. How to build full-stack apps"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram Reels</option>
                <option value="YouTube">YouTube Shorts / Video</option>
                <option value="Facebook">Facebook In-Stream</option>
                <option value="WhatsApp">WhatsApp Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Initial View Count</label>
              <input
                type="number"
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Original Video URL</label>
              <input
                type="url"
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="https://tiktok.com/@user/video/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Destination Target URL</label>
              <input
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="https://johnnyedgelimited.com/landing"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving Video Record...' : 'Log Video Attribution'}
          </button>

          {message && (
            <div className={`p-3 rounded-lg text-xs ${message.startsWith('Success') ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300' : 'bg-red-950/40 border border-red-800/50 text-red-300'}`}>
              {message}
            </div>
          )}
        </form>

        {/* Video Performance Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-indigo-300">🎬 Tracked Social Videos & Attribution</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">Loading videos...</td>
                  </tr>
                ) : videos.length > 0 ? (
                  videos.map((vid: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 font-medium text-white">{vid.title}</td>
                      <td className="py-3 px-4"><span className="bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2.5 py-1 rounded-full text-xs">{vid.platform}</span></td>
                      <td className="py-3 px-4 font-mono text-indigo-400">{vid.views}</td>
                      <td className="py-3 px-4 text-gray-400 truncate max-w-xs">{vid.destination_url || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{new Date(vid.publication_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">No social videos registered yet.</td>
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