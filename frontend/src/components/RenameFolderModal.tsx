import { useState, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ModalProps } from "../interfaces/interface";
import { useChat } from "./contexts/ChatContext";
export default function RenameFolderModal({ isOpen, onClose }: ModalProps) {
  const [renamefolderName, setRenameFolderName] = useState("");
  const { renameFolder, folderToRename } = useChat();
  const handleCancel = () => {
    setRenameFolderName("");
    onClose();
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (renamefolderName.trim()) {
      onClose();
      renameFolder(folderToRename?.id || "", renamefolderName.trim());
      setRenameFolderName("");
    }
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
            className="fixed overflow-y-auto max-h-[60vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] left-1/2 top-1/2 z-50 w-[80vw] sm:w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className=" flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Rename Folder</h2>
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
                value={renamefolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                autoFocus
              />
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
                  disabled={!renamefolderName.trim()}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
