import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

const VISIBLE_MS = 5000;

/**
 * Thin iOS-style security notification.
 * Floats under the header (fixed, so it never pushes content), slides in,
 * then dismisses itself after five seconds or on tap of the close control.
 */
export default function AdBlockerProtectionBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef(null);

  const dismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible) return undefined;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setIsVisible(false);
    }, VISIBLE_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVisible]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="stea-adblock-toast"
            role="status"
            aria-live="polite"
            aria-label="AdBlocker recommendation"
            initial={{ y: -14, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -14, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className={[
              "pointer-events-auto flex w-auto max-w-[90vw] items-center gap-2 rounded-full",
              "border px-4 py-2 backdrop-blur-xl sm:max-w-md",
              "border-slate-200 bg-white/90 shadow-lg",
              "dark:border-white/10 dark:bg-[#1C1C1E]/90",
            ].join(" ")}
          >
            <ShieldAlert size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
            <p className="min-w-0 truncate text-xs text-slate-700 dark:text-zinc-300">
              Use{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">Brave</strong> or{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">uBlock</strong> to
              block ads.
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss ad-blocker notice"
              className="ml-1 flex shrink-0 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
