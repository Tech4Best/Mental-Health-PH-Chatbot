"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { WelcomeMessage } from "./WelcomeMessage";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 chat-scrollbar">
      <div className="mx-auto max-w-2xl space-y-4">
        {messages.map((msg, i) => {
          // First assistant message is the welcome — render with suggestion chips
          if (i === 0 && msg.role === "assistant" && !msg.isCrisis) {
            return <WelcomeMessage key={msg.timestamp} message={msg} />;
          }
          return <MessageBubble key={msg.timestamp + "-" + i} message={msg} />;
        })}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
