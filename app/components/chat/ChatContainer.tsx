"use client";

import { useState, useCallback } from "react";
import type { ChatMessage, ChatResponse } from "@/lib/types";
import { WELCOME_MESSAGE } from "@/lib/constants";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

const welcomeMessage: ChatMessage = {
  role: "assistant",
  content: WELCOME_MESSAGE,
  timestamp: Date.now(),
};

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Trim history to last 10 messages for the API call
        const historyForApi = [...messages, userMessage].slice(-10);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historyForApi,
          }),
        });

        const data: ChatResponse = await res.json();

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.message,
          providers: data.providers.length > 0 ? data.providers : undefined,
          isCrisis: data.isCrisis || undefined,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: ChatMessage = {
          role: "assistant",
          content:
            "I'm sorry, something went wrong. Please try again in a moment.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
