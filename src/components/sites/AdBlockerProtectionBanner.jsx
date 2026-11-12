import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";

/**
 * Compact single-row ad-blocker notice.
 * iOS-native styling: one line of copy, one dismiss target, zero chrome.
 */
export default function AdBlockerProtectionBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="AdBlocker recommendation"
      className="mx-4 mt-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors duration-300 dark:border-white/10 dark:bg-[#151515]"
    >
      <div className="flex min-w-0 items-center gap-2">
        <ShieldAlert size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
        <p className="truncate text-xs text-slate-600 dark:text-zinc-300">
          Use{" "}
          <a
            href="https://brave.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-white"
          >
            Brave
          </a>{" "}
          or{" "}
          <a
            href="https://ublockorigin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-white"
          >
            uBlock
          </a>{" "}
          to block ads
        </p>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="-mr-1 flex shrink-0 items-center justify-center rounded-full p-1 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-white/5"
      >
        <X size={16} className="text-slate-400 dark:text-zinc-500" />
      </button>
    </div>
  );
}
