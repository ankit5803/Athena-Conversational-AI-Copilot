"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, MoreHorizontal, Copy, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TemplateRowProps } from "../interfaces/interface";

// Define template type

// Define component props

export default function TemplateRow({
  template,
  onUseTemplate,
  onEditTemplate,
  onRenameTemplate,
  onDeleteTemplate,
}: TemplateRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleUse = () => {
    onUseTemplate?.(template);
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEditTemplate?.(template);
    setShowMenu(false);
  };

  const handleRename = () => {
    const newName = prompt(
      `Rename template "${template.name}" to:`,
      template.name
    );
    if (newName && newName.trim() && newName !== template.name) {
      onRenameTemplate?.(template.id, newName.trim());
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete the template "${template.name}"?`
      )
    ) {
      onDeleteTemplate?.(template.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <button
          onClick={handleUse}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          title={`Use template: ${template.snippet}`}
        >
          <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{template.name}</div>
            <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {template.snippet}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <span className="hidden px-1 text-xs text-zinc-500 dark:text-zinc-400 group-hover:inline">
            Use
          </span>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="rounded p-1 opacity-0 transition-opacity hover:bg-zinc-200 dark:hover:bg-zinc-700 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full z-[100] mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <button
                    onClick={handleUse}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Copy className="h-3 w-3" />
                    Use Template
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={handleRename}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Rename
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
