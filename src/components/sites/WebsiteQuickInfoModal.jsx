/**
 * WebsiteQuickInfoModal — iOS-sheet style command panel for a website card.
 *
 * Mobile: bottom sheet anchored to the safe area, scrollable, never clipped.
 * Desktop: same sheet centred in the viewport.
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

  // Escape closes the sheet
  useEffect(() => {
    if (!site) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [site, onClose]);

  // Lock body scroll while open, restore exactly what was there before
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

  const handleFavClick = () => {
    if (onToggleFavorite) onToggleFavorite(site);
  };

  if (typeof document === "undefined") return null;

  const secondaryBtn =
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#2C2C2E] text-sm font-medium text-white transition-colors duration-150 active:bg-[#3A3A3C]";

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end justify-center sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-info-title"
    >
      {/* dimmer */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-md"
        aria-hidden="true"
        style={{ animation: "steaQuickFade 180ms ease-out" }}
      />

      <div
        className={[
          "relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto",
          "rounded-t-3xl border-t border-white/10 bg-[#1C1C1E] px-6 pt-6",
          /* keep the primary button clear of the home indicator */
          "pb-[calc(2.5rem+env(safe-area-inset-bottom))]",
          "text-white shadow-[0_-20px_60px_rgba(0,0,0,0.6)]",
          /* desktop: full rounded card, centred */
          "sm:rounded-3xl sm:border sm:pb-10",
          "sm:shadow-[0_24px_60px_rgba(0,0,0,0.6)]",
        ].join(" ")}
        style={{ animation: "steaSheetUp 260ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* sheet grabber (mobile only) */}
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />

        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close (Esc)"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition-colors duration-150 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* ── App icon: the logo IS the icon, no box ── */}
        <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center">
          <WebsiteIcon
            website={site}
            size={80}
            imgScale={1}
            style={{
              background: "transparent",
              border: "0",
              borderRadius: 16,
              boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {/* ── Title / domain ── */}
        <h2
          id="quick-info-title"
          className="mt-4 text-center text-2xl font-bold tracking-tight text-white"
        >
          {title}
        </h2>
        <p className="mt-1 text-center text-sm text-zinc-400">{domain || "External website"}</p>

        {/* ── badges ── */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {isPremium ? (
            <span className="flex items-center gap-1.5 rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-3 py-1 text-xs font-semibold text-[#F5A623]">
              <ShieldCheck size={12} strokeWidth={2.5} />
              Premium
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck size={12} strokeWidth={2.5} />
              Free
            </span>
          )}
          <span className="flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
            {categoryLabel}
          </span>
          {pricingTag && !isPremium ? (
            <span className="flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
              {pricingTag}
            </span>
          ) : null}
        </div>

        {/* ── description ── */}
        <p className="mt-4 text-center text-[15px] leading-relaxed text-zinc-300">{desc}</p>

        {/* ── primary action ── */}
        <button
          type="button"
          onClick={handleOpenExternal}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 text-lg font-bold text-black shadow-[0_4px_14px_rgba(245,166,35,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-amber-400 active:scale-[0.98]"
        >
          <span>Open Website</span>
          <ExternalLink size={18} strokeWidth={2.5} />
        </button>

        {/* ── secondary actions ── */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className={`${secondaryBtn} ${isFavorite ? "!border-[#F5A623]/35 !bg-[#F5A623]/10 text-[#F5A623]" : ""}`}
            onClick={handleFavClick}
            title={isFavorite ? "Saved to favorites" : "Add to favorites"}
          >
            <Star
              size={15}
              fill={isFavorite ? "#F5A623" : "none"}
              stroke={isFavorite ? "#F5A623" : "currentColor"}
              strokeWidth={2}
            />
            <span>{isFavorite ? "Saved" : "Favorite"}</span>
          </button>

          <button type="button" className={secondaryBtn} onClick={handleShare} title="Share this site">
            <Share2 size={15} strokeWidth={2} />
            <span>{shareFeedback || "Share"}</span>
          </button>

          <button type="button" className={secondaryBtn} onClick={handleCopyLink} title="Copy STEA link">
            {copied ? (
              <>
                <Check size={15} strokeWidth={2.5} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={15} strokeWidth={2} />
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
        @keyframes steaSheetUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes steaQuickFade { from { opacity: 1; } to { opacity: 1; } }
          @keyframes steaSheetUp { from { opacity: 1; transform: none; } to { opacity: 1; transform: none; } }
        }
      `}</style>
    </div>,
    document.body
  );
}
