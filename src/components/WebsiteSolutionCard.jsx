import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { useTranslation } from "../i18n/index.js";
import WebsiteIcon from "./sites/WebsiteIcon.jsx";
import { extractHostname } from "./sites/favicon.js";

/* ── Skeleton — same box as the real card, so the grid never jumps ───── */
export function WebsiteCardSkeleton({ index = 0 }) {
  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <div
      aria-hidden="true"
      className="flex h-full min-h-[196px] flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#11151F]"
      style={{ animationDelay: reducedMotion ? "0ms" : `${index * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-12 animate-pulse rounded-md bg-slate-200 dark:bg-white/10" />
        <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-5 h-12 w-12 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
      <div className="mt-auto space-y-2 pt-6">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  );
}

function fmtViews(v) {
  if (!v) return "0";
  if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
  if (v >= 1000) return (v / 1000).toFixed(1) + "K";
  return String(v);
}

/**
 * WebsiteSolutionCard — STEA Premium Card v2 (Phase 2)
 *
 * Light: white card on #F8F9FA page · Dark: #11151F card on #0B0F19 page
 * Uniform height, tactile hover lift, theme-aware via Tailwind `dark:` + tokens.
 */
export function WebsiteSolutionCard({
  site,
  onSelect,
  onOpen,
  onDetails,
  isFavorite,
  onToggleFavorite,
  rank,
  index = 0,
  loading = false,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /* NOTE: all hooks run before the skeleton early-return — the old version
     returned before useEffect, which is a conditional-hook violation. */
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) {
      setReducedMotion(true);
      setIsVisible(true);
      return undefined;
    }

    const el = cardRef.current;
    if (!el) return undefined;

    if (el.getBoundingClientRect().top < window.innerHeight) setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [site]);

  if (loading || !site) {
    return <WebsiteCardSkeleton index={index} />;
  }

  const title = site.name || site.title || "Untitled Website";
  let domain =
    site.domain ||
    extractHostname(site.url || site.websiteUrl || site.link || "") ||
    "";
  if (domain.startsWith("www.")) domain = domain.slice(4);

  const isTrusted = Boolean(
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

  const openDetails = () => {
    if (onDetails || onSelect) {
      (onDetails || onSelect)(site);
      return;
    }
    const slug = site.slug || site.id;
    if (slug) navigate(`/site/${slug}`, { state: { website: site } });
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(site);
  };

  const staggerDelay = reducedMotion ? 0 : index * 30;

  return (
    <div
      ref={cardRef}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
      role="button"
      tabIndex={0}
      title={title}
      style={{ transitionDelay: `${staggerDelay}ms` }}
      className={[
        /* shell */
        "stea-card-v2 group relative flex h-full min-h-[150px] w-full min-w-0 cursor-pointer select-none flex-col md:min-h-[196px]",
        /* iOS secondary system background: #FFF / #1C1C1E */
        "rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm md:p-4",
        "dark:border-white/5 dark:bg-[#1C1C1E]",
        "transition-all duration-200 ease-out",
        /* hover — subtle scale + soft depth */
        "hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/60",
        "dark:hover:shadow-black/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "active:scale-[0.98]",
        /* reveal */
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      {/* ── Top row: badge (left) + favorite (right) ── */}
      <div className="flex items-start justify-between gap-2">
        {isTrusted ? (
          <span className="rounded-md border border-amber-500/20 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 md:px-2 md:text-[10px] dark:text-amber-500">
            Paid
          </span>
        ) : (
          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 md:px-2 md:text-[10px] dark:text-emerald-400">
            Free
          </span>
        )}

        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={
            isFavorite
              ? t("buttons.unfavorite", "Remove from Favorites")
              : t("buttons.saveWebsite", "Save to Favorites")
          }
          className="-m-2 flex items-center justify-center rounded-full p-1.5 transition-all duration-200 ease-out hover:scale-110 active:scale-95"
        >
          <Star
            size={16}
            strokeWidth={1.8}
            fill={isFavorite ? "currentColor" : "none"}
            className={
              isFavorite
                ? "text-amber-500"
                : "text-slate-300 dark:text-white/20"
            }
          />
        </button>
      </div>

      {/* ── Logo ── */}
      <div className="mt-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/50 bg-slate-50 transition-all duration-200 ease-out group-hover:scale-105 md:mt-5 md:h-12 md:w-12 dark:border-white/5 dark:bg-white/5">
        <WebsiteIcon
          website={site}
          size={28}
          style={{ background: "transparent", border: "0", boxShadow: "none" }}
        />
      </div>

      {/* ── Text block, pinned to the bottom so every card aligns ── */}
      <div className="mt-auto min-w-0 pt-3 md:pt-5">
        <h3 className="truncate text-[13px] font-semibold tracking-tight text-slate-900 md:text-sm dark:text-white">
          {title}
        </h3>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-slate-500 md:mt-1 md:text-xs dark:text-[#8E8E93]">
          <span
            aria-hidden="true"
            className="shrink-0 transition-colors duration-300 group-hover:text-amber-500"
          >
            ↗
          </span>
          <span className="truncate">{domain || "Visit"}</span>
        </p>
        {rank ? <span className="sr-only">Rank {rank}</span> : null}
      </div>
    </div>
  );
}

export default WebsiteSolutionCard;
