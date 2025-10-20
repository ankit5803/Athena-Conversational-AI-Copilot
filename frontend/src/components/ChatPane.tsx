"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  Ref,
  useEffect,
} from "react";
import { Pencil, RefreshCw, Check, X, Square } from "lucide-react";
// import FormattedAIMessage from "./FormattedAIMessage";
import Message from "./Message";
import Composer from "./Composer";
import { ComposerHandle } from "@/interfaces/interface";
import { cls, timeAgo } from "../utils/util";
import type { MessageType } from "@/interfaces/interface";
import { ChatPaneProps, ChatPaneHandle } from "../interfaces/interface";
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
  { onEditMessage, onResendMessage, isThinking },
  ref: Ref<ChatPaneHandle>
) {
  const { selectedConversation } = useChat();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
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
  if (!selectedConversation) return null;

  const tags = ["Certified", "Personalized", "Experienced", "Helpful"];
  const messages: MessageType[] = Array.isArray(selectedConversation.messages)
    ? selectedConversation.messages
    : [];
  const count = messages.length || selectedConversation.messageCount || 0;
  // const containerRef = useRef<ReactMutableRefObject<HTMLElement>>(null);
  // useStickyScroll(containerRef, messages);

  function startEdit(m: MessageType) {
    setEditingId(m._id);
    setDraft(m.content);
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }
  function saveEdit() {
    if (!editingId) return;
    onEditMessage?.(editingId, draft);
    cancelEdit();
  }
  function saveAndResend() {
    if (!editingId) return;
    onEditMessage?.(editingId, draft);
    onResendMessage?.(editingId);
    cancelEdit();
  }

  // const [formatted, setFormatted] = useState("");
  // const [unformated, setUnformated] = useState("");

  // useEffect(() => {
  //   (async () => {
  //     const html = await formatMessageFromAI(unformated);
  //     setFormatted(html);
  //   })();
  // }, [unformated]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
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
                {editingId === m._id ? (
                  <div
                    className={cls(
                      "rounded-2xl border p-2",
                      "border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full resize-y rounded-xl bg-transparent p-2 text-sm outline-none"
                      rows={3}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-900"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={saveAndResend}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Save & Resend
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <Message role={m.role}>
                    {m.role === "user" ? (
                      <>
                        <div className="whitespace-pre-wrap">{m.content}</div>
                        <div className="mt-1 flex gap-2 text-[11px] text-zinc-500">
                          <button
                            className="inline-flex items-center gap-1 hover:underline"
                            onClick={() => startEdit(m)}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1 hover:underline"
                            onClick={() => onResendMessage?.(m._id)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Resend
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        className="whitespace-pre-wrap prose prose-invert max-w-none dark:prose-invert prose-zinc prose-sm leading-loose"
                        dangerouslySetInnerHTML={{ __html: m.content }}
                      />
                    )}
                    {/* <FormattedAIMessage content={m.content} /> */}
                  </Message>
                )}
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
