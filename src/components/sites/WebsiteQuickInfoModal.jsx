/**
 * WebsiteQuickInfoModal — centred iOS-style alert card.
 *
 * Centred on every breakpoint (no bottom sheet), light/dark aware,
 * scale-and-fade entrance, scrolls inside an 85vh cap.
 */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, ExternalLink, Share2, Copy, Check, X, ShieldCheck } from "lucide-react";
import WebsiteIcon from "./WebsiteIcon.jsx";
import { useTranslation } from "../../i18n/index.js";
import { getWebsiteCategoryLabel } from "../../data/websiteCategories.js";
import { normalizeWebsiteCategorySlug } from "../../constants/categoryOrder.js";

function toStoredWebsite(site) {
  if (!site?.id) return null;
  return {
    websiteId: site.id,
    title: site.name || site.title || "Untitled Website",
    image: site.thumbnailUrl || site.bannerUrl || site.imageUrl || site.image || site.coverUrl || site.logoUrl || "",
    url: site.url || site.link || site.websiteUrl || "",
    category: site.category || "",
    savedAt: Date.now(),
  };
}

function rememberWebsite(site) {
  try {
    const stored = toStoredWebsite(site);
    if (!stored) return;
    const raw = localStorage.getItem("stea_recent_websites");
    const existing = raw ? JSON.parse(raw) : [];
    const next = [stored, ...existing.filter((item) => item.websiteId !== stored.websiteId)].slice(0, 12);
    localStorage.setItem("stea_recent_websites", JSON.stringify(next));
  } catch {}
}

export default function WebsiteQuickInfoModal({
  site,
  onClose,
  onToggleFavorite,
  isFavorite = false,
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    if (!site) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [site, onClose]);

  useEffect(() => {
    if (!site) return undefined;
    document.documentElement.classList.add("stea-modal-open");
    return () => document.documentElement.classList.remove("stea-modal-open");
  }, [site]);

  useEffect(() => {
    if (!site) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [site]);

  if (!site) return null;

  const title = site.name || site.title || "Untitled Website";
  const rawUrl = site.url || site.websiteUrl || site.link || "";
  const targetUrl = rawUrl.startsWith("http") ? rawUrl : rawUrl ? `https://${rawUrl}` : "";

  let domain = "";
  try {
    if (targetUrl) domain = new URL(targetUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = site.domain || rawUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }

  const categorySlug = normalizeWebsiteCategorySlug(site.category || site.categorySlug || "");
  const categoryLabel = getWebsiteCategoryLabel(categorySlug) || site.category || "General";
  const desc = site.description || site.desc || "Explore this curated website on STEA.";
  const isPremium = Boolean(
    site.isPaid ||
      site.pricing === "Paid" ||
      site.pricing === "Subscription" ||
      site.isTrusted ||
      site.trusted ||
      site.isPinned ||
      site.pinned ||
      site.featured ||
      site.isFeatured ||
      site.sourceStatus === "official" ||
      site.sourceStatus === "verified" ||
      site.verified ||
      site.isOfficial
  );
  const pricingTag = site.pricing || site.pricingType || "";

  const canonicalSteaUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/site/${site.slug || site.id}`
      : `https://stea.africa/site/${site.slug || site.id}`;

  const handleOpenExternal = () => {
    rememberWebsite(site);
    if (targetUrl) window.open(targetUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalSteaUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = canonicalSteaUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} on STEA`, text: desc, url: canonicalSteaUrl });
      } catch (err) {
        if (err.name !== "AbortError") handleCopyLink();
      }
    } else {
      handleCopyLink();
      setShareFeedback("Link copied!");
      setTimeout(() => setShareFeedback(""), 2000);
    }
  };

  const secondaryBtn = [
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors",
    "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
    "dark:border-white/5 dark:bg-[#2C2C2E] dark:text-white dark:hover:bg-[#3A3A3C]",
  ].join(" ");

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/80 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-info-title"
      style={{ animation: "steaQuickFade 160ms ease-out" }}
    >
      <div
        className={[
          "relative w-full max-w-sm overflow-y-auto overflow-x-hidden",
          "max-h-[85vh] rounded-3xl bg-white shadow-2xl dark:bg-[#1C1C1E] sm:max-w-md",
          "text-slate-900 dark:text-white",
        ].join(" ")}
        style={{ animation: "steaModalPop 220ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close (Esc)"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-zinc-400 dark:hover:bg-white/20"
        >
          <X size={16} />
        </button>

        {/* body */}
        <div className="px-6 pt-8">
          {/* App icon: the logo IS the icon, no box */}
          <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center">
            <WebsiteIcon
              website={site}
              size={80}
              imgScale={1}
              style={{
                background: "transparent",
                border: "0",
                borderRadius: 16,
                boxShadow: "0 8px 22px rgba(0,0,0,0.28)",
              }}
            />
          </div>

          <h2
            id="quick-info-title"
            className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {title}
          </h2>
          <p className="mt-1 text-center text-sm text-slate-500 dark:text-zinc-400">
            {domain || "External website"}
          </p>

          {/* badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {isPremium ? (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-500">
                <ShieldCheck size={12} strokeWidth={2.5} />
                Premium
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={12} strokeWidth={2.5} />
                Free
              </span>
            )}
            <span className="flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              {categoryLabel}
            </span>
            {pricingTag && !isPremium ? (
              <span className="flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                {pricingTag}
              </span>
            ) : null}
          </div>

          {/* description */}
          <p className="mt-4 text-center text-[15px] leading-relaxed text-slate-600 dark:text-zinc-300">
            {desc}
          </p>
        </div>

        {/* primary action */}
        <div className="mt-6 px-6">
          <button
            type="button"
            onClick={handleOpenExternal}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 text-lg font-bold text-black shadow-[0_4px_14px_rgba(245,166,35,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-amber-400 active:scale-[0.98]"
          >
            <span>Open Website</span>
            <ExternalLink size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* secondary actions */}
        <div className="mt-6 flex gap-2 px-6 pb-6">
          <button
            type="button"
            className={`${secondaryBtn} ${
              isFavorite
                ? "!border-amber-500/35 !bg-amber-500/10 !text-amber-600 dark:!text-[#F5A623]"
                : ""
            }`}
            onClick={() => onToggleFavorite && onToggleFavorite(site)}
            title={isFavorite ? "Saved to favorites" : "Add to favorites"}
          >
            <Star
              size={16}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
            />
            <span>{isFavorite ? "Saved" : "Favorite"}</span>
          </button>

          <button type="button" className={secondaryBtn} onClick={handleShare} title="Share this site">
            <Share2 size={16} strokeWidth={2} />
            <span>{shareFeedback || "Share"}</span>
          </button>

          <button type="button" className={secondaryBtn} onClick={handleCopyLink} title="Copy STEA link">
            {copied ? (
              <>
                <Check size={16} strokeWidth={2.5} className="text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy size={16} strokeWidth={2} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes steaQuickFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* centre pop — no slide-up */
        @keyframes steaModalPop {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes steaQuickFade { from { opacity: 1; } to { opacity: 1; } }
          @keyframes steaModalPop { from { opacity: 1; transform: none; } to { opacity: 1; transform: none; } }
        }
      `}</style>
    </div>,
    document.body
  );
}
