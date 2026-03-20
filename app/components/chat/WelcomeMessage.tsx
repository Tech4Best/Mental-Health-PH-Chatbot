"use client";

import type { ChatMessage } from "@/lib/types";
import { SUGGESTION_CHIPS } from "@/lib/constants";

interface WelcomeMessageProps {
  message: ChatMessage;
}

export function WelcomeMessage({ message }: WelcomeMessageProps) {
  const handleChipClick = (text: string) => {
    // Find the chat input and set its value, then trigger send
    const input = document.querySelector("textarea") as HTMLTextAreaElement;
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-700 transition-colors hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-300 dark:hover:bg-zinc-800"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
