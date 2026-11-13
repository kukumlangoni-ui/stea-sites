import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";

/**
 * Minimal single-line ad-blocker notice — an iOS pill, not an alert card.
 * One line of copy, one dismiss target, no extra buttons or chrome.
 */
export default function AdBlockerProtectionBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="AdBlocker recommendation"
      className={[
        "mx-auto mt-4 flex max-w-2xl items-center justify-between",
        "w-[calc(100%-2rem)] rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3",
        "border-slate-200 bg-white shadow-sm",
        "dark:border-white/10 dark:bg-[#151515] dark:shadow-lg",
        "transition-all duration-300",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center">
        <span className="mr-3 flex shrink-0 items-center" aria-hidden="true">
          <ShieldAlert size={16} className="text-amber-500" />
        </span>
        <p className="min-w-0 truncate text-xs text-slate-600 dark:text-zinc-400 sm:text-sm">
          Use{" "}
          <a
            href="https://brave.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 dark:text-white dark:decoration-zinc-600"
          >
            Brave
          </a>{" "}
          or{" "}
          <a
            href="https://ublockorigin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 dark:text-white dark:decoration-zinc-600"
          >
            uBlock
          </a>{" "}
          to block ads
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss ad-blocker notice"
        className="-mr-1 ml-2 flex shrink-0 items-center justify-center rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
