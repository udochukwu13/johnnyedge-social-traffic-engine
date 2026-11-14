"use client";
import React, { useState } from "react";
import ClientWorkspaceSwitcher from "@/components/ClientWorkspaceSwitcher";
import CRMLeadTable from "@/components/CRMLeadTable";

export default function DashboardPage() {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState("ws_def456");
  
  const workspaces = [
    { id: "ws_def456", name: "E-Commerce Growth Team", slug: "ecommerce-growth", isClientAccount: false },
    { id: "ws_client01", name: "Apex Fashion Store (Client)", slug: "apex-fashion", isClientAccount: true },
    { id: "ws_client02", name: "Lagos Tech Gadgets (Client)", slug: "lagos-tech", isClientAccount: true },
  ];

  const handleWorkspaceSwitch = (newId: string) => {
    setCurrentWorkspaceId(newId);
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F4F7FC] font-sans antialiased">
      {/* Top Navbar */}
      <header className="border-b border-blue-900/40 bg-[#0D1B2A]/50 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            JE
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">JohnnyEdge Social Traffic Engine</h1>
            <p className="text-xs text-[#A5B4C7]">Attribution & Conversion SaaS Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ClientWorkspaceSwitcher 
            workspaces={workspaces} 
            currentWorkspaceId={currentWorkspaceId} 
            onSwitch={handleWorkspaceSwitch} 
          />
          <div className="h-9 w-9 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-sm font-bold text-blue-300">
            UD
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0D1B2A]/80 backdrop-blur-xl p-6 rounded-2xl border border-blue-900/40 shadow-xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold">Total Clicks</span>
            <div className="text-3xl font-extrabold text-white">14,250</div>
            <span className="text-xs text-[#20C997] font-medium">↑ 18.4% this week</span>
          </div>
          <div className="bg-[#0D1B2A]/80 backdrop-blur-xl p-6 rounded-2xl border border-blue-900/40 shadow-xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold">Active Tracking Links</span>
            <div className="text-3xl font-extrabold text-white">38</div>
            <span className="text-xs text-blue-400 font-medium">All systems operational</span>
          </div>
          <div className="bg-[#0D1B2A]/80 backdrop-blur-xl p-6 rounded-2xl border border-blue-900/40 shadow-xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold">Leads Captured (CRM)</span>
            <div className="text-3xl font-extrabold text-white">1,280</div>
            <span className="text-xs text-[#20C997] font-medium">12.4% conversion rate</span>
          </div>
          <div className="bg-[#0D1B2A]/80 backdrop-blur-xl p-6 rounded-2xl border border-blue-900/40 shadow-xl space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold">AI Assistant Quota</span>
            <div className="text-3xl font-extrabold text-white">840 / 1k</div>
            <span className="text-xs text-[#FFB84D] font-medium">Business Edition Tier</span>
          </div>
        </div>

        {/* Action Grid / Core Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Tracking Link Generator Card */}
          <div className="bg-[#0D1B2A]/90 backdrop-blur-xl p-8 rounded-3xl border border-blue-900/50 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Generate Smart Tracking Link</h2>
              <p className="text-sm text-[#A5B4C7]">Create a trackable short link with UTM parameters for TikTok, Instagram, or YouTube.</p>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const res = await fetch("/api/tracking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  workspaceId: currentWorkspaceId,
                  destinationUrl: formData.get("destinationUrl"),
                  utmSource: formData.get("utmSource"),
                  utmMedium: "social",
                  utmCampaign: formData.get("utmCampaign"),
                }),
              });
              const data = await res.json();
              if (data.success) {
                alert(`Tracking link created successfully!\nURL: ${data.data.fullTrackingUrl}`);
              } else {
                alert(`Error: ${data.error}`);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold mb-2">Destination URL</label>
                <input type="url" name="destinationUrl" placeholder="https://example.com/product" required className="w-full px-4 py-3 bg-[#07111F] border border-blue-900/70 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold mb-2">Platform / Source</label>
                  <select name="utmSource" className="w-full px-4 py-3 bg-[#07111F] border border-blue-900/70 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all">
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold mb-2">Campaign Name</label>
                  <input type="text" name="utmCampaign" placeholder="Q2_Product_Launch" required className="w-full px-4 py-3 bg-[#07111F] border border-blue-900/70 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30">
                Generate Trackable Link
              </button>
            </form>
          </div>

          {/* AI Marketing Intelligence Assistant Card */}
          <div className="bg-[#0D1B2A]/90 backdrop-blur-xl p-8 rounded-3xl border border-blue-900/50 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <h2 className="text-xl font-bold text-white">AI Marketing Intelligence</h2>
              </div>
              <p className="text-sm text-[#A5B4C7]">Ask your AI strategist for data-grounded insights on your active campaigns.</p>
            </div>

            <div className="bg-[#07111F] p-5 rounded-2xl border border-blue-900/50 text-sm text-[#F4F7FC] space-y-2 flex-grow overflow-y-auto max-h-48">
              <p className="text-blue-400 font-semibold">JohnnyEdge AI Assistant:</p>
              <p className="text-[#A5B4C7]">"Welcome! Your active campaigns are performing well. Select a prompt below or ask a custom question regarding your click distributions and lead conversions."</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const promptText = formData.get("promptText") as string;
              const res = await fetch("/api/ai/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId: currentWorkspaceId, prompt: promptText }),
              });
              const data = await res.json();
              if (data.success) {
                alert(`AI Recommendation:\n${data.data.recommendation}`);
              } else {
                alert(`Error: ${data.error}`);
              }
            }} className="flex space-x-3">
              <input type="text" name="promptText" placeholder="Ask e.g., Which campaign is generating the highest revenue?" required className="flex-grow px-4 py-3 bg-[#07111F] border border-blue-900/70 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500 transition-all text-sm" />
              <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 transition-all shadow-lg">
                Ask AI
              </button>
            </form>
          </div>
        </div>

        {/* CRM Lead Management Table Section */}
        <CRMLeadTable workspaceId={currentWorkspaceId} />
      </main>
    </div>
  );
}