import React, { memo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { TOKENS } from "./tokens.js";
import { getWebsiteCategoryLabel } from "../../data/websiteCategories.js";
import { normalizeWebsiteCategorySlug } from "../../constants/categoryOrder.js";

/**
 * SitesCategoryNavRail — Fixed/Sticky Category Navigation Rail (Desktop) & Sticky Scrollable Nav (Mobile)
 *
 * Spec:
 *  - Fixed/sticky left navigation rail (never moves when page scrolls)
 *  - Premium sliding animated pill indicator on active category change
 *  - Category names as primary typographic navigation
 *  - Small real counts aligned to the right
 *  - Selected category gets subtle illuminated/pill treatment
 *  - Clean, minimal, zero visual clutter (no giant emoji icons)
 *  - Seamless responsive adaptation for mobile & tablet
 */
function SitesCategoryNavRail({
  categories = [],
  websitesByCategory = {},
  activeCategory = "all",
  onSelectCategory,
  totalWebsitesCount = 0,
}) {
  const mobileNavRef = useRef(null);
  const activeMobileBtnRef = useRef(null);

  // Auto-scroll active item into view on mobile
  useEffect(() => {
    if (activeMobileBtnRef.current && mobileNavRef.current) {
      const container = mobileNavRef.current;
      const el = activeMobileBtnRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeCategory]);

  const items = categories.map((cat) => {
    const slug = normalizeWebsiteCategorySlug(
      cat.slug || cat.categoryId || cat.id || cat.name
    );
    const label = cat.label || cat.name || cat.title || getWebsiteCategoryLabel(slug);
    const count =
      (typeof cat.count === "number" ? cat.count : 0) ||
      (websitesByCategory[slug] || []).length;
    return {
      slug,
      label,
      count,
      path: `/websites/${slug}`,
    };
  }).filter((item) => item.slug);

  const handleCategoryClick = (e, item) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(item.slug, item.path);
    }
  };

  // "All" control scrolls to top; active state is resolved by IntersectionObserver.
  const handleAllClick = (e) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory("all", "/websites");
    }
  };

  return (
    <>
      {/* ─── DESKTOP LEFT NAVIGATION RAIL ─── */}
      <aside
        aria-label="Category navigation"
        className="sticky top-24 z-30 hidden w-[204px] shrink-0 self-start lg:block"
      >
        <div data-nav-rail-inner className="max-h-[calc(100vh-8rem)] overflow-y-auto pb-6 pr-2 [scrollbar-color:rgba(120,130,150,0.25)_transparent] [scrollbar-width:thin]">
          <div className="mb-2 flex items-baseline justify-between gap-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
            <span>Categories</span>
            {totalWebsitesCount > 0 && (
              <span className="text-[10px] font-medium normal-case tracking-normal text-slate-400 dark:text-zinc-500">
                {totalWebsitesCount} sites
              </span>
            )}
          </div>

          <nav className="flex flex-col gap-1" role="navigation">
            {/* Individual Categories — every item maps to a real homepage section */}
            {items.map((item) => {
              const isActive = activeCategory === item.slug;
              return (
                <a
                  key={item.slug}
                  href={item.path}
                  onClick={(e) => handleCategoryClick(e, item)}
                  data-cat-slug={item.slug}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 no-underline",
                    "text-[13.5px] tracking-tight",
                    "transition-all duration-300 ease-in-out",
                    isActive
                      ? "bg-slate-100 font-medium text-slate-900 dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate pr-2" title={item.label}>
                    {item.label}
                  </span>
                  {item.count > 0 && (
                    <span
                      className={[
                        "shrink-0 text-[11.5px] font-semibold tabular-nums",
                        isActive
                          ? "text-slate-500 dark:text-zinc-300"
                          : "text-slate-400 dark:text-zinc-500",
                      ].join(" ")}
                    >
                      {item.count}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ─── MOBILE STICKY HORIZONTAL CATEGORY BAR ─── */}
      <div className="sites-category-mobile-nav" aria-label="Mobile category navigation">
        <div className="sites-category-mobile-scroll" ref={mobileNavRef}>
          <button
            type="button"
            ref={activeCategory === "all" || !activeCategory ? activeMobileBtnRef : null}
            onClick={handleAllClick}
            className={`sites-category-mobile-pill ${activeCategory === "all" || !activeCategory ? "is-active" : ""}`}
          >
            {(activeCategory === "all" || !activeCategory) && (
              <motion.div
                layoutId="activeCategoryMobilePill"
                className="sites-mobile-pill-active-bg"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>All</span>
            {totalWebsitesCount > 0 && (
              <span className="sites-mobile-pill-count" style={{ position: "relative", zIndex: 1 }}>{totalWebsitesCount}</span>
            )}
          </button>

          {items.map((item) => {
            const isActive = activeCategory === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                ref={isActive ? activeMobileBtnRef : null}
                onClick={(e) => handleCategoryClick(e, item)}
                className={`sites-category-mobile-pill ${isActive ? "is-active" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryMobilePill"
                    className="sites-mobile-pill-active-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{item.label}</span>
                {item.count > 0 && (
                  <span className="sites-mobile-pill-count" style={{ position: "relative", zIndex: 1 }}>{item.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        /* ─── Desktop rail is fully Tailwind-driven — no local rules ─── */

        .sites-mobile-pill-active-bg {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: var(--stea-gold);
          border: 1px solid transparent;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
          z-index: 0;
          pointer-events: none;
        }

        /* ─── Mobile Horizontal Nav ─── */
        .sites-category-mobile-nav {
          display: none;
          position: sticky;
          top: 56px;
          z-index: var(--stea-z-rail, 40);
          background: color-mix(in srgb, var(--stea-page) 96%, transparent);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          margin: 0 calc(-1 * clamp(12px, 2.4vw, 28px)) 16px;
          padding: 10px clamp(12px, 2.4vw, 28px);
          border-bottom: 1px solid var(--stea-border);
          box-sizing: border-box;
          max-width: 100vw;
          overflow: hidden;
        }

        .sites-category-mobile-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
          width: 100%;
        }

        .sites-category-mobile-scroll::-webkit-scrollbar {
          display: none;
        }

        .sites-category-mobile-pill {
          appearance: none;
          border: 1px solid transparent;
          background: color-mix(in srgb, var(--stea-text) 8%, transparent);
          color: ${TOKENS.text2};
          font-size: 13px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 999px;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: background-color 200ms ease, color 200ms ease, transform 200ms ease;
          flex-shrink: 0;
          position: relative;
        }

        .sites-category-mobile-pill:active,
        .sites-category-mobile-pill:hover {
          color: ${TOKENS.text};
        }

        .sites-category-mobile-pill:active {
          transform: scale(0.96);
        }

        .sites-category-mobile-pill.is-active {
          background: var(--stea-gold);
          border-color: transparent;
          color: #000000;
          font-weight: 600;
        }

        .sites-mobile-pill-count {
          font-size: 10.5px;
          font-weight: 700;
          color: ${TOKENS.text3};
          font-variant-numeric: tabular-nums;
        }

        .sites-category-mobile-pill.is-active .sites-mobile-pill-count {
          color: rgba(0, 0, 0, 0.55);
        }

        /* Responsive Breakpoint: Desktop rail on >1024px, Sleek horizontal bar on <=1024px */
        @media (max-width: 1024px) {
          .sites-category-nav-rail {
            display: none !important;
          }
          .sites-category-mobile-nav {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

export default memo(SitesCategoryNavRail);
