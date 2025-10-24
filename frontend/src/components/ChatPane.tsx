"use client";

import { forwardRef, useImperativeHandle, useRef, Ref, useEffect } from "react";
import { Pencil, RefreshCw, Check, X, Square } from "lucide-react";
import BlurText from "./BlurText";
import Message from "./Message";
import Composer from "./Composer";
import type { MessageType } from "@/interfaces/interface";
import {
  ComposerHandle,
  ChatPaneProps,
  ChatPaneHandle,
} from "@/interfaces/interface";
import { timeAgo } from "../utils/util";
import { useChat } from "./contexts/ChatContext";

function ThinkingMessage() {
  const { setIsThinking, setThinkingConvId } = useChat();
  function pauseThinking(): void {
    setIsThinking(false);
    setThinkingConvId(null);
  }
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
        </div>
        <span className="text-sm text-zinc-500">AI is thinking...</span>
        <button
          onClick={pauseThinking}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Square className="h-3 w-3" /> Pause
        </button>
      </div>
    </Message>
  );
}

const ChatPane = forwardRef<ChatPaneHandle, ChatPaneProps>(function ChatPane(
  { isThinking },
  ref: Ref<ChatPaneHandle>
) {
  const { conversations, selectedConversation, setShowCreateChatModal } =
    useChat();
  const composerRef = useRef<ComposerHandle>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent: string) => {
        composerRef.current?.insertTemplate(templateContent);
      },
    }),
    []
  );
  useEffect(() => {
    if (!selectedConversation || !scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [selectedConversation?.messages?.length]);
  if (!selectedConversation)
    return conversations.length === 0 ? (
      <div className="ml-16 sm:ml-0 w-[calc(100%-64px)] h-full flex flex-col justify-center items-center ">
        <BlurText
          text="Start a Conversation to Begin"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl mb-8"
        />
        <button
          onClick={() => setShowCreateChatModal(true)}
          className="cursor-pointer w-fit transform rounded-full bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 animate-bounce"
        >
          Start New Chat
        </button>
      </div>
    ) : (
      <div className="ml-16 sm:ml-0 h-full w-calc(100%-64px) flex justify-center items-center">
        <BlurText
          text="Select a Chat or Start a New One"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl mb-8 "
        />
      </div>
    );

  const tags = ["Certified", "Personalized", "Experienced", "Helpful"];
  const messages: MessageType[] = Array.isArray(selectedConversation.messages)
    ? selectedConversation.messages
    : [];
  const count = messages.length || selectedConversation.messageCount || 0;

  return (
    <div className="flex ml-16 sm:ml-0 mt-10 sm:mt-0 min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
      >
        <div className="mb-2 text-3xl font-serif tracking-tight sm:text-4xl md:text-5xl">
          <span className="block leading-[1.05] font-sans text-2xl">
            {selectedConversation.title}
          </span>
        </div>
        <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Updated {timeAgo(selectedConversation.updatedAt)} · {count} messages
        </div>

        {/* <div className="mb-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-5 dark:border-zinc-800">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
              >
                {t}
              </span>
            ))}
          </div> */}

        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No messages yet. Say hello to start.
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div key={m._id} className="space-y-2">
                <Message role={m.role}>
                  {m.role === "user" ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <div
                      className="whitespace-pre-wrap prose prose-invert max-w-none dark:prose-invert prose-zinc prose-sm leading-loose"
                      dangerouslySetInnerHTML={{ __html: m.content }}
                    />
                  )}
                </Message>
              </div>
            ))}
            {isThinking && <ThinkingMessage />}
          </>
        )}
      </div>

      <Composer ref={composerRef} />
    </div>
  );
});

export default ChatPane;
