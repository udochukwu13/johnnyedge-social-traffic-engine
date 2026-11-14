"use client";
import React, { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  pipeline_stage: string;
  lead_source: string;
  created_at: string;
}

export default function CRMLeadTable({ workspaceId }: { workspaceId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch(`/api/leads?workspaceId=${workspaceId}`);
        const json = await res.json();
        if (json.success) {
          setLeads(json.data);
        }
      } catch (err) {
        console.error("Failed to load leads", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [workspaceId]);

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case "new": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "contacted": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "qualified": return "bg-emerald-500/25 text-[#20C997] border-[#20C997]/30";
      case "converted": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#A5B4C7]">Loading CRM leads pipeline...</div>;
  }

  return (
    <div className="bg-[#0D1B2A]/90 backdrop-blur-xl rounded-3xl border border-blue-900/50 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-blue-900/40 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Lead Management CRM</h2>
          <p className="text-sm text-[#A5B4C7]">Real-time inbound inquiries captured from social traffic funnels.</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-blue-900/50 text-blue-400 text-xs font-semibold">
          {leads.length} Total Leads
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-blue-900/40 text-xs uppercase tracking-wider text-[#A5B4C7] bg-[#07111F]/50">
              <th className="p-4 font-semibold">Lead Name</th>
              <th className="p-4 font-semibold">Contact Info</th>
              <th className="p-4 font-semibold">Business</th>
              <th className="p-4 font-semibold">Source</th>
              <th className="p-4 font-semibold">Stage</th>
              <th className="p-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/30 text-sm">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#A5B4C7]">
                  No leads captured yet. Publish a landing page or submit a test lead via API!
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-blue-950/30 transition-colors">
                  <td className="p-4 font-medium text-white">{lead.name || "Anonymous"}</td>
                  <td className="p-4 text-[#A5B4C7]">
                    <div>{lead.email}</div>
                    <div className="text-xs text-blue-400">{lead.phone || "No phone"}</div>
                  </td>
                  <td className="p-4 text-[#A5B4C7]">{lead.business_name || "—"}</td>
                  <td className="p-4 text-[#A5B4C7]">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-900/30 text-blue-300 text-xs">
                      {lead.lead_source}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageBadgeColor(lead.pipeline_stage)}`}>
                      {lead.pipeline_stage.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#A5B4C7]">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}