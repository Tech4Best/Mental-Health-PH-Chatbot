"use client";

import type { ChatMessage } from "@/lib/types";
import { ProviderCard } from "./ProviderCard";
import { CrisisAlert } from "./CrisisAlert";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (message.isCrisis) {
    return <CrisisAlert />;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.providers && message.providers.length > 0 && (
          <div className="mt-3 space-y-3">
            {message.providers.map((provider, i) => (
              <ProviderCard key={provider.name + "-" + i} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
