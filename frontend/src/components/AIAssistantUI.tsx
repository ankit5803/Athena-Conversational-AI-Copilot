"use client";

import type {
  Conversation,
  CollapsedState,
  Folder,
  MessageType,
  Template,
} from "../interfaces/interface";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  MutableRefObject,
} from "react";
import { Calendar, LayoutGrid, MoreHorizontal } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./chatheader";
import ChatPane from "./ChatPane";
import GhostIconButton from "./GhostIconButton";
import ThemeToggle from "./ThemeToggle";
import {
  INITIAL_CONVERSATIONS,
  INITIAL_TEMPLATES,
  INITIAL_FOLDERS,
} from "../utils/mockData";

import { connectToDatabase } from "../utils/database";

connectToDatabase();

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<CollapsedState>(() => {
    try {
      const raw = localStorage.getItem("sidebar-collapsed");
      return raw
        ? JSON.parse(raw)
        : { pinned: true, recent: false, folders: true, templates: true };
    } catch {
      return { pinned: true, recent: false, folders: true, templates: true };
    }
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
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<any>(null);

  // --- Thinking state ---
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingConvId, setThinkingConvId] = useState<string | null>(null);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNewChat();
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
    if (!selectedId && conversations.length > 0) {
      createNewChat();
    }
  }, []);

  // --- Derived data ---
  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const pinned = filtered
    .filter((c) => c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const recent = filtered
    .filter((c) => !c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 10);

  const folderCounts = useMemo(() => {
    const map: Record<string, number> = Object.fromEntries(
      folders.map((f) => [f.name, 0])
    );
    for (const c of conversations)
      if (map[c.folder] != null) map[c.folder] += 1;
    return map;
  }, [conversations, folders]);

  // --- Actions ---
  function togglePin(id: string): void {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }

  function createNewChat(): void {
    const id = Math.random().toString(36).slice(2);
    const item: Conversation = {
      id,
      title: "New Chat",
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      preview: "Say hello to start...",
      pinned: false,
      folder: "Work Projects",
      messages: [],
    };
    setConversations((prev) => [item, ...prev]);
    setSelectedId(id);
    setSidebarOpen(false);
  }

  function createFolder(): void {
    const name = prompt("Folder name");
    if (!name) return;
    if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase()))
      return alert("Folder already exists.");
    setFolders((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), name },
    ]);
  }

  function sendMessage(convId: string, content: string): void {
    if (!content.trim()) return;
    const now = new Date().toISOString();
    const userMsg: MessageType = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content,
      createdAt: now,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...(c.messages || []), userMsg];
        return {
          ...c,
          messages: msgs,
          updatedAt: now,
          messageCount: msgs.length,
          preview: content.slice(0, 80),
        };
      })
    );

    setIsThinking(true);
    setThinkingConvId(convId);

    setTimeout(() => {
      setIsThinking(false);
      setThinkingConvId(null);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const asstMsg: MessageType = {
            id: Math.random().toString(36).slice(2),
            role: "assistant",
            content: "Got it — I'll help with that.",
            createdAt: new Date().toISOString(),
          };
          const msgs = [...(c.messages || []), asstMsg];
          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
            preview: asstMsg.content.slice(0, 80),
          };
        })
      );
    }, 2000);
  }

  function editMessage(
    convId: string,
    messageId: string,
    newContent: string
  ): void {
    const now = new Date().toISOString();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = (c.messages || []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, editedAt: now } : m
        );
        return {
          ...c,
          messages: msgs,
          preview: msgs[msgs.length - 1]?.content?.slice(0, 80) || c.preview,
        };
      })
    );
  }

  function resendMessage(convId: string, messageId: string): void {
    const conv = conversations.find((c) => c.id === convId);
    const msg = conv?.messages?.find((m) => m.id === messageId);
    if (!msg) return;
    sendMessage(convId, msg.content);
  }

  function pauseThinking(): void {
    setIsThinking(false);
    setThinkingConvId(null);
  }

  function handleUseTemplate(template: Template): void {
    if (composerRef.current?.insertTemplate) {
      composerRef.current.insertTemplate(template.content);
    }
  }

  const selected = conversations.find((c) => c.id === selectedId) || null;

  // === Render ===
  return (
    <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-3 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="ml-1 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-flex h-4 w-4 items-center justify-center">
            ✱
          </span>{" "}
          AI Assistant
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

      <div className="mx-auto flex h-[calc(100vh-0px)] max-w-[1400px]">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          setTheme={setTheme}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          conversations={conversations}
          pinned={pinned}
          recent={recent}
          folders={folders}
          folderCounts={folderCounts}
          selectedId={selectedId}
          onSelect={(id: string) => setSelectedId(id)}
          togglePin={togglePin}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
          createFolder={createFolder}
          createNewChat={createNewChat}
          templates={templates}
          setTemplates={setTemplates}
          onUseTemplate={handleUseTemplate}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <Header
            createNewChat={createNewChat}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarOpen={setSidebarOpen}
          />
          <ChatPane
            ref={composerRef}
            conversation={selected}
            onSend={(content: string) =>
              selected && sendMessage(selected.id, content)
            }
            onEditMessage={(messageId: string, newContent: string) =>
              selected && editMessage(selected.id, messageId, newContent)
            }
            onResendMessage={(messageId: string) =>
              selected && resendMessage(selected.id, messageId)
            }
            isThinking={isThinking && thinkingConvId === selected?.id}
            onPauseThinking={pauseThinking}
          />
        </main>
      </div>
    </div>
  );
}
