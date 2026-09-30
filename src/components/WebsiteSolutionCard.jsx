import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { useTranslation } from "../i18n/index.js";
import WebsiteIcon from "./sites/WebsiteIcon.jsx";
import { extractHostname } from "./sites/favicon.js";

/**
 * WebsiteCardSkeleton — Shimmer skeleton matching the exact card dimensions.
 * Shows while Firestore data is loading. Uses CSS gradient shimmer.
 */
export function WebsiteCardSkeleton({ index = 0 }) {
  const reducedMotion = typeof window !== "undefined"
    ? window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    : false;

  return (
    <div
      className="stea-website-card-skeleton"
      aria-hidden="true"
      style={{
        animationDelay: reducedMotion ? "0ms" : `${index * 30}ms`,
      }}
    >
      {/* Top row: badge + star placeholder */}
      <div className="stea-skel-top-row">
        <div className="stea-skel-badge" />
        <div className="stea-skel-star" />
      </div>
      {/* Center: icon + title lines */}
      <div className="stea-skel-center">
        <div className="stea-skel-icon" />
        <div className="stea-skel-title-wrap">
          <div className="stea-skel-title-line" style={{ width: "80%" }} />
          <div className="stea-skel-title-line" style={{ width: "55%" }} />
        </div>
      </div>
      {/* Bottom: domain text */}
      <div className="stea-skel-bottom-row">
        <div className="stea-skel-domain-line" />
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
 * WebsiteSolutionCard — STEA Premium Compact Card
 *
 * Cinematic dark surface card with:
 *  - Subtle border, premium hover lift + glow
 *  - Top row: PAID/FREE pill badge + Star Favorite button
 *  - Middle row: WebsiteIcon + Title
 *  - Bottom row: ↗ domain
 *  - Scroll reveal on first viewport entry
 *  - Consistent across category views, compact listings, and discovery stream
 */
export function WebsiteSolutionCard({
  site,
  isMobile,
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

  // ── Skeleton loading state ──
  if (loading || !site) {
    return <WebsiteCardSkeleton index={index} />;
  }

  const title = site.name || site.title || "Untitled Website";
  let domain = site.domain || extractHostname(site.url || site.websiteUrl || site.link || "") || "";
  if (domain.startsWith("www.")) {
    domain = domain.slice(4);
  }

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
    if (onToggleFavorite) {
      onToggleFavorite(site);
    }
  };

  // ── Scroll reveal via IntersectionObserver ──
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) {
      setReducedMotion(true);
      setIsVisible(true);
      return undefined;
    }

    const el = cardRef.current;
    if (!el) return undefined;

    // If already above the fold, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setIsVisible(true);
    }

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
  }, []);

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
      className={`stea-website-compact-card stea-btn ${
        isVisible ? "is-revealed" : "is-hidden-before-reveal"
      }`}
      title={title}
      style={{
        transitionDelay: reducedMotion ? "0ms" : `${staggerDelay}ms`,
      }}
    >
      {/* Top Row: PAID (purple) or FREE (green) pill badge + Star Favorite Button */}
      <div className="stea-card-top-row">
        {isTrusted ? (
          <span className="stea-card-trusted-badge stea-card-badge-paid">PAID</span>
        ) : (
          <span className="stea-card-trusted-badge stea-card-badge-free">FREE</span>
        )}

        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? t("buttons.unfavorite", "Remove from Favorites") : t("buttons.saveWebsite", "Save to Favorites")}
          className={`stea-card-star-btn ${isFavorite ? "is-favorite" : ""}`}
        >
          <Star
            size={13}
            fill={isFavorite ? "#F5A623" : "none"}
            stroke={isFavorite ? "#F5A623" : "currentColor"}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Main Center Area: Brand Icon + Title */}
      <div className="stea-card-center">
        <div className="stea-card-brand-display">
          <div className="stea-card-icon-wrap">
            <WebsiteIcon website={site} size={34} />
          </div>
          <h3 className="stea-card-title">{title}</h3>
        </div>
      </div>

      {/* Bottom Row: ↗ domain */}
      <div className="stea-card-bottom-row">
        <span className="stea-card-arrow-icon" aria-hidden="true">↗</span>
        <span className="stea-card-domain-text">{domain || "Visit"}</span>
      </div>

    </div>
  );
}

export default WebsiteSolutionCard;
