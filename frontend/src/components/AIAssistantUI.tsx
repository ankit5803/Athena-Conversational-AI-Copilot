"use client";

import type { CollapsedState } from "../interfaces/interface";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, LayoutGrid, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Sidebar from "./Sidebar";
import Header from "./chatheader";
import ChatPane from "./ChatPane";
import GhostIconButton from "./GhostIconButton";
import ThemeToggle from "./ThemeToggle";
import { useChat } from "./contexts/ChatContext";
// import { INITIAL_TEMPLATES } from "../utils/mockData";

// === Component ===
export default function AIAssistantUI(): React.JSX.Element {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches)
        return "dark";
    }
    return "light";
  });

  // --- Theme persistence ---
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        const saved = localStorage.getItem("theme");
        if (!saved) setTheme(e.matches ? "dark" : "light");
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } catch {
      /* ignore */
    }
  }, []);

  // --- Sidebar state ---
  const { conversations, createConversation } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<CollapsedState>(() => {
    // try {
    //   const raw = localStorage.getItem("sidebar-collapsed");
    //   return raw
    //     ? JSON.parse(raw)
    //     : { pinned: true, recent: false, folders: false, templates: false };
    // } catch {
    //   return { pinned: true, recent: false, folders: true, templates: true };
    // }
    return { pinned: false, recent: false, folders: false, templates: false };
  });
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed-state");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(
        "sidebar-collapsed-state",
        JSON.stringify(sidebarCollapsed)
      );
    } catch {}
  }, [sidebarCollapsed]);

  // --- Conversations / folders / templates ---

  // const [templates, setTemplates] = useState<Template[]>([]); //INITIAL_TEMPLATES
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<any>(null);

  // --- Thinking state ---
  const { isThinking, selectedConversation, thinkingConvId } = useChat();

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createConversation();
      }
      if (!e.metaKey && !e.ctrlKey && e.key === "/") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, conversations]);

  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      createConversation();
    }
  }, []);

  // === Render ===
  return (
    <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-3 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="ml-1 flex items-center gap-1 text-lg font-semibold tracking-wide">
          <span className="inline-flex h-7 w-7 items-center justify-center">
            <Image src="/athenalogo.png" alt="Logo" width={28} height={28} />
          </span>
          Athena AI
        </div>
        <div className="ml-auto flex items-center gap-2">
          <GhostIconButton label="Schedule">
            <Calendar className="h-4 w-4" />
          </GhostIconButton>
          <GhostIconButton label="Apps">
            <LayoutGrid className="h-4 w-4" />
          </GhostIconButton>
          <GhostIconButton label="More">
            <MoreHorizontal className="h-4 w-4" />
          </GhostIconButton>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>

      <div className="mx-auto flex h-[calc(100vh-0px)] max-w-full">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          setTheme={setTheme}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <Header />
          <ChatPane
            ref={composerRef}
            isThinking={
              isThinking && thinkingConvId === selectedConversation?.id
            }
          />
        </main>
      </div>
    </div>
  );
}
