import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Star } from "lucide-react";
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
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#151515]"
      style={{ animationDelay: reducedMotion ? "0ms" : `${index * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-14 animate-pulse rounded-md bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-4 animate-pulse rounded-md bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
        <div className="h-3 w-8 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  );
}

/**
 * WebsiteSolutionCard — final premium card.
 *
 * Blends the airy Option 5 layout (logo + text side by side) with Option 4's
 * elevated accents: hairline border, inner highlight, hairline footer divider
 * and a status dot. Light and dark both supported.
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

  // Paid → "Premium" badge. Falls back to the legacy trust signal when the
  // record has no explicit price field.
  const isPremium = Boolean(
    site.isPaid ?? site.paid ?? site.isPremium ?? site.premium ?? isTrusted
  );

  // Short right-hand footer tag: explicit quality/tag wins, then a compact
  // label for the category (full category names are far too long for a 205px card).
  const SHORT_TAGS = {
    "movies & tv shows": "Streaming",
    "live sports": "Sports",
    "ebooks": "Books",
    "ai tools": "AI",
    "automation": "Auto",
    "design": "Design",
    "developer tools": "Dev",
    "music": "Music",
    "news": "News",
    "education": "Learn",
    "productivity": "Prod",
    "social": "Social",
    "shopping": "Shop",
    "finance": "Finance",
    "gaming": "Gaming",
  };
  const rawTag = String(site.quality || site.tag || site.category || "").trim();
  const footerTag =
    SHORT_TAGS[rawTag.toLowerCase()] ||
    (rawTag ? rawTag.split(/[\s&]+/)[0].slice(0, 10) : "");

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
        "stea-card-v2 group relative flex h-full w-full min-w-0 cursor-pointer select-none flex-col",
        /* canvas: white / #151515 with an inner top highlight */
        "rounded-2xl border border-slate-200 bg-white p-4",
        "dark:border-white/10 dark:bg-[#151515]",
        "shadow-[inset_0_1px_0_rgba(15,23,42,0.03)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        "transition-all duration-300 ease-out",
        /* hover — lift + deepen */
        "hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60",
        "dark:hover:border-white/20 dark:hover:shadow-black/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "active:translate-y-0 active:scale-[0.99]",
        /* reveal */
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      {/* ── Top row: badge + star ── */}
      <div className="flex items-start justify-between gap-2">
        {isPremium ? (
          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:border-[#F5A623]/20 dark:bg-[#F5A623]/10 dark:text-[#F5A623]">
            Premium
          </span>
        ) : (
          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
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
                : "text-slate-300 transition-colors duration-200 hover:text-amber-500 dark:text-zinc-600"
            }
          />
        </button>
      </div>

      {/* ── Middle row: logo + text, side by side ── */}
      <div className="mt-4 flex min-w-0 items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 transition-transform duration-200 ease-out group-hover:scale-105 dark:bg-white/5">
          <WebsiteIcon
            website={site}
            size={56}
            imgScale={0.86}
            style={{
              background: "transparent",
              border: "0",
              boxShadow: "none",
              borderRadius: 0,
            }}
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-0.5 flex min-w-0 items-center gap-1 text-sm text-slate-500 dark:text-zinc-400">
            <ArrowUpRight
              size={12}
              aria-hidden="true"
              className="shrink-0 text-slate-400 transition-colors duration-300 group-hover:text-amber-500 dark:text-zinc-500"
            />
            <span className="truncate">{domain || "Visit"}</span>
          </p>
        </div>
      </div>

      {/* ── Bottom row: status dot + tag ── */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
        {isPremium ? (
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-amber-500 dark:text-[#F5A623]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-[#F5A623]" aria-hidden="true" />
            Premium
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden="true" />
            Free
          </span>
        )}

        {footerTag ? (
          <span className="truncate text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
            {footerTag}
          </span>
        ) : null}

        {rank ? <span className="sr-only">Rank {rank}</span> : null}
      </div>
    </div>
  );
}

export default WebsiteSolutionCard;
