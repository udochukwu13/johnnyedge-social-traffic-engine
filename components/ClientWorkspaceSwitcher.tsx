"use client";
import React, { useState } from "react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  isClientAccount: boolean;
}

interface SwitcherProps {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onSwitch: (workspaceId: string) => void;
}

export default function ClientWorkspaceSwitcher({ workspaces, currentWorkspaceId, onSwitch }: SwitcherProps) {
  const [selectedId, setSelectedId] = useState(currentWorkspaceId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedId(newId);
    onSwitch(newId);
  };

  return (
    <div className="flex items-center space-x-3 bg-[#0D1B2A] px-4 py-2.5 rounded-xl border border-blue-900/40 shadow-lg backdrop-blur-md">
      <span className="text-xs uppercase tracking-wider text-[#A5B4C7] font-semibold">Active Workspace:</span>
      <select
        value={selectedId}
        onChange={handleChange}
        className="bg-[#07111F] text-[#F4F7FC] font-medium px-3 py-1.5 rounded-lg border border-blue-800 focus:outline-none focus:border-[#2878FF] transition-all cursor-pointer"
      >
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name} {ws.isClientAccount ? "(Client Account)" : "(Internal)"}
          </option>
        ))}
      </select>
    </div>
  );
}