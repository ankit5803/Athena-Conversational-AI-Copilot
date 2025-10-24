"use client";

import React from "react";
import { Star, Trash2 } from "lucide-react";
import { ConversationRowProps } from "@/interfaces/interface";
import { cls, timeAgo } from "../utils/util";
import { useChat } from "./contexts/ChatContext";
export default function ConversationRow({
  data,
  active,
  showMeta = false,
  onDelete,
  isFolderRow = false,
}: ConversationRowProps) {
  const { setSelectedConversation, togglePin } = useChat();
  const count = Array.isArray(data.messages)
    ? data.messages.length
    : data.messageCount;

  return (
    <div className="group relative">
      <button
        onClick={() => setSelectedConversation(data)}
        className={cls(
          "-mx-1 flex w-[calc(100%+8px)] items-center gap-2 rounded-lg px-2 py-2 text-left cursor-pointer",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
        title={data.title}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium tracking-tight">
              {data.title}
            </span>
            {!isFolderRow && (
              <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
                {timeAgo(data.updatedAt)}
              </span>
            )}
          </div>
          {showMeta && (
            <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {count} messages
            </div>
          )}
        </div>

        {!isFolderRow && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              togglePin(data.id);
            }}
            title={data.pinned ? "Unpin" : "Pin"}
            className="rounded-md p-1 text-zinc-500 lg:opacity-0 opacity:100 transition group-hover:opacity-100 hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
            aria-label={data.pinned ? "Unpin conversation" : "Pin conversation"}
          >
            {data.pinned ? (
              <Star className="h-4 w-4 fill-zinc-800 text-zinc-800 dark:fill-zinc-200 dark:text-zinc-200" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </div>
        )}

        {onDelete && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            title="Delete"
            className="rounded-md p-1 text-zinc-500 lg:opacity-0 opacity:100 transition group-hover:opacity-100 hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
            aria-label="Delete chat"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </div>
        )}
      </button>
    </div>
  );
}
