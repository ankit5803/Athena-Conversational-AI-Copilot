"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SearchIcon,
  Plus,
  Star,
  Clock,
  FolderIcon,
  Settings,
} from "lucide-react";
import type {
  Folder,
  SidebarProps,
  Conversation,
} from "../interfaces/interface";
import SidebarSection from "./SidebarSection";
import ConversationRow from "./ConversationRow";
import FolderRow from "./FolderRow";
import ThemeToggle from "./ThemeToggle";
import CreateNewChatModal from "./CreateNewChatModal";
import DeleteChatModal from "./DeleteChatModal";
import CreateFolderModal from "./CreateFolderModal";
import SearchModal from "./SearchModal";
import RenameFolderModal from "./RenameFolderModal";
import DeleteFolderModal from "./DeleteFolderModal";
import SettingsPopover from "./SettingsPopover";
import { cls } from "../utils/util";
import { useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { useChat } from "./contexts/ChatContext";
export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  query,
  setQuery,
  searchRef,
  sidebarCollapsed = false,
  setSidebarCollapsed,
}: SidebarProps) {
  const { user } = useUser();
  const {
    selectedConversation,
    setChatToDelete,
    pinned,
    recent,
    folders,
    setFolderToRename,
    setFolderToDelete,
  } = useChat();
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);

  // === Folder Logic ===
  const getConversationsByFolder = (folder: Folder) => {
    const convs = folders.find((f) => f.id === folder.id)?.conversations;
    return convs || [];
  };
  const handleDeleteConversation = (conversation: Conversation) => {
    setChatToDelete(conversation);
    setShowDeleteChatModal(true);
  };

  const handleDeleteFolder = (folder: Folder) => {
    setFolderToDelete(folder);
    setShowDeleteFolderModal(true);
  };

  const handleRenameFolder = (folder: Folder) => {
    setFolderToRename(folder);
    setShowRenameFolderModal(true);
  };

  // === Collapsed Sidebar ===
  if (sidebarCollapsed) {
    return (
      <motion.aside
        initial={{ width: 320 }}
        animate={{ width: 64 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-center border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <button
            onClick={() => setShowCreateChatModal(true)}
            className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            title="Search"
          >
            <SearchIcon className="h-5 w-5" />
          </button>

          <div className="mt-auto mb-4">
            <SettingsPopover>
              <button
                className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </SettingsPopover>
          </div>
        </div>
        <CreateNewChatModal
          isOpen={showCreateChatModal}
          onClose={() => setShowCreateChatModal(false)}
        />
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onCreateNewChat={() => setShowCreateChatModal(true)}
        />
      </motion.aside>
    );
  }

  // === Full Sidebar ===
  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar content */}
      <AnimatePresence>
        {(open || typeof window !== "undefined") && (
          <motion.aside
            key="sidebar"
            initial={{ x: -340 }}
            animate={{ x: open ? 0 : 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cls(
              "z-50 flex h-full w-80 shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              "fixed inset-y-0 left-0 md:static md:translate-x-0"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-0">
                <div
                  className="grid h-8 w-8 place-items-center rounded-xl bg-linear-to-br text-white dark:text-zinc-900"
                  // from-blue-500
                  // to-indigo-500
                  // dark:from-zinc-200
                  // dark:to-zinc-300
                  // shadow-sm
                >
                  <Image
                    src="/athenalogo.png"
                    alt="Athena Logo"
                    width={28}
                    height={28}
                  />
                </div>
                <div className="text-sm font-semibold tracking-wider">
                  Athena
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden md:block rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>

                <button
                  onClick={onClose}
                  className="md:hidden rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 pt-3">
              <label htmlFor="search" className="sr-only">
                Search conversations
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                />
              </div>
            </div>

            {/* New Chat Button */}
            <div className="px-3 pt-3">
              <button
                onClick={() => setShowCreateChatModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900 cursor-pointer"
                title="New Chat (⌘N)"
              >
                <Plus className="h-4 w-4" /> Start New Chat
              </button>
            </div>

            {/* Scrollable sections */}
            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] px-2 pb-4">
              {/* Pinned */}
              <SidebarSection
                icon={<Star className="h-4 w-4" />}
                title="PINNED CHATS"
                collapsed={collapsed.pinned}
                onToggle={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    pinned: !prev.pinned,
                  }))
                }
              >
                {pinned.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    Pin important threads for quick access.
                  </div>
                ) : (
                  pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedConversation?.id}
                    />
                  ))
                )}
              </SidebarSection>

              {/* Recent */}
              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title="RECENT"
                collapsed={collapsed.recent}
                onToggle={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    recent: !prev.recent,
                  }))
                }
              >
                {recent.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    No conversations yet. Start a new one!
                  </div>
                ) : (
                  recent.map((c) => (
                    <div key={c.id}>
                      <ConversationRow
                        data={c}
                        active={c.id === selectedConversation?.id}
                        showMeta
                        onDelete={() => handleDeleteConversation(c)}
                      />
                    </div>
                  ))
                )}
              </SidebarSection>

              {/* Folders */}
              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title="FOLDERS"
                collapsed={collapsed.folders}
                onToggle={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    folders: !prev.folders,
                  }))
                }
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Create folder
                  </button>

                  {folders.map((f) => (
                    <FolderRow
                      key={f.id}
                      name={f.name}
                      conversations={getConversationsByFolder(f)}
                      onDeleteFolder={() => handleDeleteFolder(f)}
                      onRenameFolder={() => handleRenameFolder(f)}
                    />
                  ))}
                </div>
              </SidebarSection>
            </nav>

            {/* Footer */}
            <div className="mt-auto border-t border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SettingsPopover>
                  <button className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                </SettingsPopover>
                <div className="ml-auto">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800/60">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900 overflow-hidden">
                  {user && (
                    <Image
                      src={user.imageUrl}
                      width={32}
                      height={32}
                      alt="userimg"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {user?.fullName}
                    {/* {user?.username} */}
                  </div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    Free workspace
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreateNewChatModal
        isOpen={showCreateChatModal}
        onClose={() => setShowCreateChatModal(false)}
      />

      <DeleteChatModal
        isOpen={showDeleteChatModal}
        onClose={() => setShowDeleteChatModal(false)}
      />
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onCreateNewChat={() => setShowCreateChatModal(true)}
      />

      <RenameFolderModal
        isOpen={showRenameFolderModal}
        onClose={() => setShowRenameFolderModal(false)}
      />
      <DeleteFolderModal
        isOpen={showDeleteFolderModal}
        onClose={() => setShowDeleteFolderModal(false)}
      />
    </>
  );
}
