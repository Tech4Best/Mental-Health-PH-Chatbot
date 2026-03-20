export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
        <div className="flex items-center gap-1">
          <span className="typing-dot h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <span
            className="typing-dot h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="typing-dot h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  );
}
