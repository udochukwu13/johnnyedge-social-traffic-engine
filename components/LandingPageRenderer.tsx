"use client";
import React from "react";

interface Block {
  type: "hero" | "video" | "lead_form" | "cta_button" | "whatsapp_btn";
  content: {
    headline?: string;
    subheadline?: string;
    videoUrl?: string;
    buttonText?: string;
    targetUrl?: string;
    whatsappNumber?: string;
  };
}

interface LandingPageProps {
  title: string;
  themeConfig: { accentColor: string; theme: string };
  blocks: Block[];
  workspaceId: string;
  campaignId?: string;
}

export default function LandingPageRenderer({ title, themeConfig, blocks }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#07111F] text-[#F4F7FC] font-sans antialiased px-4 py-12 selection:bg-blue-600 selection:text-white">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: themeConfig.accentColor || "#2878FF" }}>
            {title}
          </h1>
          <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        </header>

        {blocks.map((block, index) => {
          switch (block.type) {
            case "hero":
              return (
                <div key={index} className="text-center space-y-4 p-8 bg-[#0D1B2A]/80 backdrop-blur-xl rounded-2xl border border-blue-900/50 shadow-2xl">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{block.content.headline}</h2>
                  <p className="text-[#A5B4C7] text-base md:text-lg leading-relaxed">{block.content.subheadline}</p>
                </div>
              );
            case "video":
              return (
                <div key={index} className="aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-blue-900/40 shadow-2xl">
                  <iframe src={block.content.videoUrl} className="w-full h-full" allowFullScreen title="Campaign Video Preview" />
                </div>
              );
            case "lead_form":
              return (
                <form key={index} action="/api/leads" method="POST" className="p-8 bg-[#0D1B2A]/90 backdrop-blur-xl rounded-2xl border border-blue-900/50 space-y-5 shadow-2xl">
                  <div className="space-y-1 text-center">
                    <h3 className="text-xl font-bold text-white">Claim Your Exclusive Offer</h3>
                    <p className="text-sm text-[#A5B4C7]">Enter your details below to secure your spot.</p>
                  </div>
                  <div className="space-y-4">
                    <input type="text" name="name" placeholder="Full Name" required className="w-full px-4 py-3 bg-[#07111F] border border-blue-900/70 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 transition-all" />
                    <input type="email" name="email" placeholder="Email Address" required className="w-full px-4 py-3 bg-[#07111F] border border-blue-900/70 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 transition-all" />
                    <input type="tel" name="phone" placeholder="Phone Number (Optional)" className="w-full px-4 py-3 bg-[#07111F] border border-blue-900/70 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 transition-all" />
                    <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg hover:opacity-95 transform active:scale-[0.99]" style={{ backgroundColor: themeConfig.accentColor || "#2878FF" }}>
                      Submit & Secure Offer
                    </button>
                  </div>
                </form>
              );
            case "whatsapp_btn":
              return (
                <a key={index} href={`https://wa.me/${block.content.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 w-full text-center py-4 rounded-xl font-bold text-white bg-[#20C997] hover:bg-[#1bb384] transition-all shadow-xl hover:shadow-green-900/30">
                  <span>Chat Instantly on WhatsApp</span>
                </a>
              );
            default:
              return null;
          }
        })}

        <footer className="text-center pt-8 border-t border-blue-900/30 text-xs text-[#A5B4C7]">
          Powered by <span className="text-blue-400 font-semibold">JohnnyEdge Social Traffic Engine</span>
        </footer>
      </div>
    </div>
  );
}