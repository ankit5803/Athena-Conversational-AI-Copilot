"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { useState, FormEvent } from "react";
import { CreateFolderModalProps, Conversation } from "../interfaces/interface";
import { useChat } from "./contexts/ChatContext";

export default function CreateFolderModal({
  isOpen,
  onClose,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [selectedConversations, setSelectedConversations] = useState<
    Conversation[]
  >([]);
  const { conversations, createFolder, folders } = useChat();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (folderName.trim() && selectedConversations.length > 0) {
      console.log(selectedConversations);
      createFolder({
        name: folderName.trim(),
        conversations: selectedConversations,
      });
      setFolderName("");
      setSelectedConversations([]);
      onClose();
    }
  };

  const handleCancel = () => {
    setFolderName("");
    setSelectedConversations([]);
    onClose();
  };

  const toggleSelect = (id: string) => {
    setSelectedConversations((convs) => {
      if (convs.find((c) => c.id === id)) {
        return convs.filter((c) => c.id !== id);
      } else {
        const convToAdd = conversations.find((c) => c.id === id);
        if (convToAdd) {
          return [...convs, convToAdd];
        }
        return convs;
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed overflow-y-auto max-h-[60vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className=" flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Folder name</h2>
              <button
                onClick={handleCancel}
                className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="E.g. Marketing Projects"
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                autoFocus
              />

              <div className="mt-4 flex items-start gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <Lightbulb className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="font-medium mb-1">What's a folder?</div>
                  <div>
                    Folders keep chats, files, and custom instructions in one
                    place. Use them for ongoing work, or just to keep things
                    tidy.
                  </div>
                </div>
              </div>
              <div className="ml-2 mt-4 font-semibold text-sm">
                Add your Chats
              </div>
              <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                {conversations.length > 0 ? (
                  <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {conversations.map((conv) => (
                      <li
                        key={conv.id}
                        className="flex items-center justify-between px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      >
                        <span className="text-sm truncate max-w-[200px]">
                          {conv.title || "Untitled Conversation"}
                        </span>
                        <input
                          type="checkbox"
                          checked={
                            !!selectedConversations.find(
                              (c) => c.id === conv.id
                            )
                          }
                          onChange={() => toggleSelect(conv.id)}
                          className="h-4 w-4 accent-blue-500 cursor-pointer"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-zinc-500 text-center">
                    No conversations found. Start one to add it to a folder.
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !folderName.trim() || selectedConversations.length === 0
                  }
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 cursor-pointer"
                >
                  Create folder
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
