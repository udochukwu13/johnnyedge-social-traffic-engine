'use client';

import { useState } from 'react';

export default function QRCodeGenerator() {
  const [url, setUrl] = useState('https://johnnyedge-social-traffic-engine.vercel.app/go/my-portfolio');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl mt-8">
      <h2 className="text-xl font-bold mb-3 text-indigo-300">📱 Campaign QR Code Generator</h2>
      <p className="text-sm text-gray-400 mb-4">Generate instant scannable QR codes for Instagram Stories, TikTok overlays, and physical flyers.</p>
      
      <div className="space-y-4">
        <input
          type="text"
          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter tracking link URL..."
        />

        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg w-48 mx-auto shadow-md">
          {/* Using a reliable public QR code API for instant rendering */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`}
            alt="Tracking Link QR Code"
            className="w-36 h-36 object-contain"
          />
          <span className="text-xs text-gray-600 mt-2 font-medium">Scan to test traffic</span>
        </div>
      </div>
    </div>
  );
}