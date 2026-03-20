"use client";

import { useState } from "react";
import { DISCLAIMER_TEXT } from "@/lib/constants";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-950/50">
      <p className="flex-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
        <span className="mr-1 font-medium">&#9888; Notice:</span>
        {DISCLAIMER_TEXT}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
        aria-label="Dismiss disclaimer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}
