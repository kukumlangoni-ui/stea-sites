import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Flame, Shield, Lock, ChevronRight } from "lucide-react";

/**
 * Detailed ad-blocker / VPN notice.
 * Premium iOS card: soft indigo glow, pill actions, tight type scale.
 * `isAfterDark` is kept for backwards compatibility with older callers.
 */
export default function AdBlockerProtectionBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const pill =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors duration-200";

  return (
    <div
      role="region"
      aria-label="AdBlocker recommendation"
      className={[
        "relative mx-auto my-4 w-full max-w-2xl overflow-hidden rounded-2xl border p-4 sm:p-5",
        "border-slate-200 bg-white shadow-sm",
        "dark:border-white/10 dark:bg-[#151515] dark:shadow-lg",
        "transition-all duration-300",
      ].join(" ")}
    >
      {/* soft indigo bloom, clipped by the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent"
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2 pr-9 text-sm font-bold text-slate-900 dark:text-white">
          <span aria-hidden="true">🛡️</span>
          <span>Before clicking any link!!!</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
          <span>Use</span>
          <a
            href="https://brave.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${pill} border-orange-500/20 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400`}
          >
            <Flame size={13} strokeWidth={2.5} aria-hidden="true" />
            Brave
          </a>
          <span>or</span>
          <a
            href="https://ublockorigin.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${pill} border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400`}
          >
            <Shield size={13} strokeWidth={2.5} aria-hidden="true" />
            uBlock Origin
          </a>
          <span>or</span>
          <a
            href="https://protonvpn.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${pill} border-indigo-500/20 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400`}
          >
            <Lock size={13} strokeWidth={2.5} aria-hidden="true" />
            Proton VPN
          </a>
        </div>

        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-zinc-500">
            to stop unwanted popups, ads, and bypass network blocks.
          </p>
          <Link
            to="/websites/after-dark"
            className={[
              "inline-flex items-center gap-1 self-end rounded-full border border-amber-500/30 px-3 py-1.5",
              "text-xs font-bold text-amber-600 transition-colors duration-200 hover:bg-amber-500/10",
              "dark:text-amber-500 sm:self-auto",
            ].join(" ")}
          >
            More AdBlockers &amp; VPN (16+)
            <ChevronRight size={14} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss ad-blocker notice"
        className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-full p-1.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
