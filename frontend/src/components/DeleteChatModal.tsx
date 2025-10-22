import { Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ModalProps } from "../interfaces/interface";
import { useChat } from "./contexts/ChatContext";
export default function DeleteFolderModal({ isOpen, onClose }: ModalProps) {
  const { chatToDelete, deleteConversation } = useChat();
  const handleCancel = () => {
    onClose();
  };
  const handleDelete = () => {
    onClose();
    deleteConversation(chatToDelete?.id || "");
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
              <h2 className="text-lg font-semibold">Delete Chat</h2>
              <button
                onClick={handleCancel}
                className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
              <Info className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <div>
                  <p>Are you sure you want to delete this chat?</p>
                  <p>
                    This will delete all its messages and cannot be undone.This
                    will also delete it from its corresponding folder(s).
                  </p>
                </div>
              </div>
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
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:text-white dark:hover:bg-red-800 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
