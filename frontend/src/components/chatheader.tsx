"use client";
// import { useState, ReactNode } from "react";
// import { Asterisk, Menu, ChevronDown } from "lucide-react";
// import { Chatbot } from "../interfaces/interface";
export default function Header() {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      {/* {sidebarCollapsed && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )} */}

      <div className="hidden md:flex relative">
        <button
          // onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
        >
          {/* {selectedBotObj &&
            (typeof selectedBotObj.icon === "string" ? (
              <span className="text-sm">{selectedBotObj.icon}</span>
            ) : (
              selectedBotObj.icon
            ))}
          {selectedBot} */}
          <span className="text-sm">Y</span>
          Athena AI
          {/* <ChevronDown className="h-4 w-4" /> */}
        </button>
      </div>
    </div>
  );
}
