"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Folder, Conversation } from "@/interfaces/interface";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface ChatContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<Conversation | null>
  >;
  fetchUserDatandsaveUser: () => void;
  createConversation: (title?: string) => Promise<void>;
  showCreateChatModal: boolean;
  setShowCreateChatModal: React.Dispatch<React.SetStateAction<boolean>>;
  refreshConversations: (userId: string) => Promise<void>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  chatToDelete: Conversation | null;
  setChatToDelete: React.Dispatch<React.SetStateAction<Conversation | null>>;
  pinned: Conversation[];
  recent: Conversation[];
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  createFolder: ({
    name,
    conversations,
  }: {
    name: string;
    conversations: Conversation[];
  }) => Promise<void>;
  folderToRename: Folder | null;
  setFolderToRename: React.Dispatch<React.SetStateAction<Folder | null>>;
  folderToDelete: Folder | null;
  setFolderToDelete: React.Dispatch<React.SetStateAction<Folder | null>>;
  renameFolder: (id: string, newName: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  togglePin: (id: string) => void;
  isThinking: boolean;
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>;
  thinkingConvId: string | null;
  setThinkingConvId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Conversation | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [thinkingConvId, setThinkingConvId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  // Derived arrays
  const pinned = conversations.filter((c) => c.pinned);
  const recent = conversations
    // .filter((c) => !c.pinned)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  // === Fetch and Save user to backend on load ===
  const fetchUserDatandsaveUser = async () => {
    try {
      await axios.get("/api/user");
    } catch (error) {
      console.error(error);
    }
  };

  // === Load conversations from backend ===

  const refreshConversations = async (userId: string) => {
    await axios
      .get(`/api/chat/${userId}`)
      .then((response) => {
        const chats = response.data.map((res: any) => ({
          ...res,
          id: res._id,
        }));
        const sortedChats = chats.sort(
          (a: Conversation, b: Conversation) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setConversations(sortedChats);

        // ✅ Pick the latest chat and set it as selected
        if (sortedChats.length > 0) {
          setSelectedConversation(sortedChats[0]);
        }
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
      });
    await axios
      .get(`/api/folder/${userId}`)
      .then((response) => {
        const folders = response.data.map((res: any) => ({
          ...res,
          conversations: res.conversations.map((c: any) => ({
            ...c,
            id: c._id,
          })),
          id: res._id,
        }));

        setFolders(folders);

        console.log(folders);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
      });
  };

  // === Create new conversation ===
  const createConversation = async () => {
    await axios
      .post("/api/chat", {
        title: `New chat ${conversations.length + 1}`,
        userId: user?.id,
      })
      .then((response) => {
        const conversation = { ...response.data, id: response.data._id };
        setConversations((prev) => [...prev, conversation]);
        setSelectedConversation(conversation);

        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error creating conversations:", error);
      });
  };
  // === Pin/unpin conversation ===

  const togglePin = async (id: string) => {
    // Optimistically update frontend immediately
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
    setFolders((prev) =>
      prev.map((folder) => ({
        ...folder,
        conversations: folder.conversations.map((conv) =>
          conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
        ),
      }))
    );

    try {
      const conv = conversations.find((c) => c.id === id);
      await axios.patch(`/api/chat/${id}`, { pinned: !conv?.pinned });
    } catch (error) {
      console.error("Error toggling pin:", error);
      // Rollback if request fails
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
      );
    }
  };
  const scrollSmoothly = () => {
    const container = document.querySelector(
      ".flex-1.space-y-5.overflow-y-auto"
    ) as HTMLElement | null;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  function formatMessageFromAI(content: string) {
    if (!content || typeof content !== "string") return "";

    const options = {
      breaks: true,
      gfm: true,
      tables: true,
      //   highlight: (code, lang) => {
      // return hljs.highlightAuto(code, [lang]).value;
      // }
    };

    // ✅ Use parseSync to stay synchronous
    const rawHtml: string | Promise<string> = marked.parse(content, options);

    const safeHtml: string = DOMPurify.sanitize(rawHtml as string);
    return safeHtml;
  }
  const streamAIResponse = async (conversationId: string, query: string) => {
    const response = await fetch(`/api/chat/${conversationId}/streammsg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok || !response.body) {
      console.error("Failed to connect to stream");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let aiMessage = ""; // build up the message progressively
    let tempMessageId = "streaming-" + Date.now();
    let tokenCount = 0;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { _id: tempMessageId, role: "assistant", content: "" },
              ],
            }
          : c
      )
    );
    setSelectedConversation((prev) => {
      if (!prev || prev.id !== conversationId) return prev;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          { _id: tempMessageId, role: "assistant", content: "" },
        ],
      };
    });

    setIsThinking(false);
    setThinkingConvId(null);
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          // console.log("Streamed data:", data);
          if (data === "[DONE]") {
            const finalContent = formatMessageFromAI(aiMessage.trim());
            // ✅ Save full AI message in DB
            await axios
              .post(`/api/chat/${conversationId}/messages`, {
                content: finalContent,
                role: "assistant",
              })
              .then((res) => {
                // After user message is sent, trigger AI response
                const updatedChat = { ...res.data, id: res.data._id };

                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === updatedChat.id
                      ? {
                          ...updatedChat,
                        }
                      : c
                  )
                );
                setSelectedConversation(updatedChat);
                setFolders((prev) =>
                  prev.map((folder) => ({
                    ...folder,
                    conversations: folder.conversations.map((conv) =>
                      conv.id === updatedChat.id ? updatedChat : conv
                    ),
                  }))
                );
              })
              .catch((err) => {
                console.error("Error saving AI message:", err);
              });

            return;
          }

          try {
            const json = JSON.parse(data);
            aiMessage += json.delta;
            tokenCount++;
            // console.log("AI Message so far:", aiMessage);
            if (tokenCount % 5 === 0 || json.delta.includes("\n")) {
              const formattedContent = formatMessageFromAI(aiMessage);

              // Typewriter update
              requestAnimationFrame(() => {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === conversationId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m._id === tempMessageId
                              ? { ...m, content: formattedContent }
                              : m
                          ),
                        }
                      : c
                  )
                );

                // ✅ Update selectedConversation only once per render
                setSelectedConversation((prev) => {
                  if (!prev || prev.id !== conversationId) return prev;
                  return {
                    ...prev,
                    messages: prev.messages.map((m) =>
                      m._id === tempMessageId ? { ...m, content: aiMessage } : m
                    ),
                  };
                });
                scrollSmoothly();
              });
            }
          } catch (err) {
            console.error("Error parsing stream data:", err);
          }
        }
      }
    }
  };

  // === Send new message ===
  const sendMessage = async (content: string) => {
    if (!selectedConversation) return;

    await axios
      .post(`/api/chat/${selectedConversation.id}/messages`, {
        content,
        role: "user",
      })
      .then((res) => {
        // After user message is sent, trigger AI response
        const updatedChat = { ...res.data, id: res.data._id };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === updatedChat.id
              ? {
                  ...updatedChat,
                }
              : c
          )
        );
        setSelectedConversation(updatedChat);
        setFolders((prev) =>
          prev.map((folder) => ({
            ...folder,
            conversations: folder.conversations.map((conv) =>
              conv.id === updatedChat.id ? updatedChat : conv
            ),
          }))
        );
      })
      .catch((err) => {
        console.error("Error sending message:", err);
      });

    setIsThinking(true);
    setThinkingConvId(selectedConversation.id);
    await streamAIResponse(selectedConversation.id, content);
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    refreshConversations(user?.id as string);
    console.log(user?.id);
  }, [isLoaded, user]);

  // === Delete conversation ===
  const deleteConversation = async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedConversation?.id === id) setSelectedConversation(null);
    setFolders((prev) =>
      prev.map((folder) => ({
        ...folder,
        conversations: folder.conversations.filter((conv) => conv.id !== id),
      }))
    );
    await axios.delete(`/api/chat/${id}`);
  };

  const createFolder = async ({
    name,
    conversations,
  }: {
    name: string;
    conversations: Conversation[];
  }) => {
    await axios
      .post("/api/folder", {
        name,
        conversations,
        userId: user?.id,
      })
      .then((response) => {
        const folder = {
          ...response.data,
          id: response.data._id,
          conversations: response.data.conversations.map((c: any) => ({
            ...c,
            id: c._id,
          })),
        };
        setFolders((prev) => [...prev, folder]);

        console.log(folder);
      })
      .catch((error) => {
        console.error("Error creating conversations:", error);
      });
  };

  const renameFolder = async (id: string, newName: string) => {
    // Optimistically update frontend immediately
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
    await axios.patch(`/api/folder/${id}`, { newName });
  };

  const deleteFolder = async (id: string) => {
    // Optimistically update frontend immediately
    setFolders((prev) => prev.filter((f) => f.id !== id));
    await axios.delete(`/api/folder/${id}`);
  };

  return (
    <ChatContext.Provider
      value={{
        fetchUserDatandsaveUser,
        conversations,
        setConversations,
        showCreateChatModal,
        setShowCreateChatModal,
        chatToDelete,
        setChatToDelete,
        refreshConversations,
        selectedConversation,
        setSelectedConversation,
        pinned,
        recent,
        folders,
        setFolders,
        createFolder,
        folderToRename,
        setFolderToRename,
        folderToDelete,
        setFolderToDelete,
        renameFolder,
        deleteFolder,
        createConversation,
        deleteConversation,
        sendMessage,
        togglePin,
        isThinking,
        setIsThinking,
        thinkingConvId,
        setThinkingConvId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};
