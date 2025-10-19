import { cls } from "../utils/util";
import type { MessageProps } from "@/interfaces/interface";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useChat } from "./contexts/ChatContext";
export default function Message({ role, children }: MessageProps) {
  const isUser = role === "user";
  const { user } = useUser();
  const { isThinking } = useChat();
  return (
    <div
      className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
          AI
        </div>
      )}
      <div
        className={cls(
          "max-w-[95%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isUser
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : isThinking
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
            : "bg-transparent text-zinc-900 dark:bg-transparent dark:text-zinc-100"
        )}
      >
        {children}
      </div>
      {isUser && (
        <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-neutral-500 overflow-hidden ">
          <Image
            className="rounded-full"
            src={user?.imageUrl || "./globe.svg"}
            alt="user"
            width={32}
            height={32}
          />
        </div>
      )}
    </div>
  );
}
