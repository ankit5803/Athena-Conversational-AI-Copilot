"use client";
import AIAssistantUI from "@/components/AIAssistantUI";
import { useEffect } from "react";
import { useChat } from "@/components/contexts/ChatContext";
export default function ChatPage() {
  const { fetchUserDatandsaveUser } = useChat();
  useEffect(() => {
    fetchUserDatandsaveUser();
  }, []);
  return <AIAssistantUI />;
}
