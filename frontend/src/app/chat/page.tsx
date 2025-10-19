"use client";
import AIAssistantUI from "@/components/AIAssistantUI";
// import axios from "axios";
// import { useEffect } from "react";
import { useChat } from "@/components/contexts/ChatContext";
export default function ChatPage() {
  const { fetchUserDatandsaveUser } = useChat();
  fetchUserDatandsaveUser();
  return <AIAssistantUI />;
}
