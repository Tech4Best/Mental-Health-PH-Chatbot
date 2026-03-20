import { CRISIS_HOTLINES } from "@/lib/constants";

export function CrisisAlert() {
  return (
    <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/50">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="Warning">
          &#9888;
        </span>
        <h2 className="text-base font-bold text-red-800 dark:text-red-300">
          Crisis Support
        </h2>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-red-900 dark:text-red-200">
        You are not alone, and help is available right now. Please reach out to
        any of these crisis support services immediately:
      </p>

      <div className="space-y-3">
        {CRISIS_HOTLINES.map((hotline) => (
          <div
            key={hotline.number}
            className="rounded-lg bg-white/80 p-3 dark:bg-red-900/30"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-red-900 dark:text-red-200">
                {hotline.name}
              </span>
              <a
                href={`tel:${hotline.number.replace(/[() -]/g, "")}`}
                className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                {hotline.number}
              </a>
            </div>
            <p className="mt-1 text-xs text-red-700 dark:text-red-400">
              {hotline.description}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm font-medium text-red-800 dark:text-red-300">
        If you or someone you know is in immediate danger, call{" "}
        <a
          href="tel:911"
          className="font-bold underline"
        >
          911
        </a>{" "}
        immediately.
      </p>
    </div>
  );
}
