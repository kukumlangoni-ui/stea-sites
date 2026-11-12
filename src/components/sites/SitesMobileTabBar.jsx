import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, LayoutGrid, Star, User } from "lucide-react";

/**
 * Floating iOS-style tab bar.
 * A glass pill with a magnetic amber dot that slides under the active tab.
 * The dot auto-cycles until the user touches the screen, then it sticks to the
 * real route for good.
 */
const TABS = [
  { to: "/", label: "Discover", Icon: Compass, isActive: (p) => p === "/" },
  {
    to: "/websites",
    label: "Categories",
    Icon: LayoutGrid,
    isActive: (p) => p.startsWith("/websites") || p.startsWith("/site/"),
  },
  { to: "/favorites", label: "Favorites", Icon: Star, isActive: (p) => p.startsWith("/favorites") },
  { to: "/profile", label: "Profile", Icon: User, isActive: (p) => p.startsWith("/profile") },
];

const DOT_SIZE = 42;
const AUTOPLAY_MS = 2600;

export default function SitesMobileTabBar({ user, onProfileGate } = {}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const trackRef = useRef(null);
  const tabRefs = useRef([]);

  const routeIndex = Math.max(0, TABS.findIndex((tab) => tab.isActive(pathname)));

  const [autoplay, setAutoplay] = useState(true);
  const [autoIndex, setAutoIndex] = useState(routeIndex); // start on the real tab
  const [dotX, setDotX] = useState(null);
  const index = autoplay ? autoIndex : routeIndex;

  /* ── place the dot exactly under the current tab ───────────────────────── */
  const placeDot = useCallback(() => {
    const track = trackRef.current;
    const tab = tabRefs.current[index];
    if (!track || !tab) return;
    const trackBox = track.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    const center = tabBox.left - trackBox.left + tabBox.width / 2;
    setDotX(center - DOT_SIZE / 2);
  }, [index]);

  useLayoutEffect(() => {
    placeDot();
    const track = trackRef.current;
    window.addEventListener("resize", placeDot);
    let observer;
    if (track && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(placeDot);
      observer.observe(track);
    }
    return () => {
      window.removeEventListener("resize", placeDot);
      if (observer) observer.disconnect();
    };
  }, [placeDot]);

  /* ── autoplay: cycles the dot, dies on first human touch ───────────────── */
  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => setAutoIndex((i) => (i + 1) % TABS.length), AUTOPLAY_MS);
    const stop = () => setAutoplay(false);

    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("keydown", stop);

    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [autoplay]);

  const tabClass = (isDotTab) =>
    [
      "relative z-10 flex h-full flex-1 items-center justify-center rounded-full no-underline",
      "transition-transform duration-300 ease-out",
      isDotTab ? "scale-[1.06] text-white" : "text-slate-500 dark:text-zinc-400",
    ].join(" ");

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed left-1/2 z-50 h-[58px] w-[min(94vw,340px)] -translate-x-1/2 rounded-full lg:hidden
                 border border-slate-300/30 bg-white/70 shadow-[0_14px_28px_-10px_rgba(0,0,0,0.28)] backdrop-blur-xl
                 dark:border-white/10 dark:bg-[#151515]/80 dark:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.8)]"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <div ref={trackRef} className="relative flex h-full w-full items-center px-1.5">
        {/* magnetic amber dot */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 z-0 rounded-full"
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            top: "50%",
            transform: `translateX(${dotX || 0}px) translateY(-50%)`,
            opacity: dotX === null ? 0 : 1,
            background: "linear-gradient(180deg, #FFD078, #F5A623)",
            boxShadow:
              "inset 0 1.5px 1px rgba(255,255,255,0.4), 0 8px 14px -4px rgba(245,166,35,0.5)",
            transition: "transform 0.55s cubic-bezier(0.3, 1.35, 0.4, 1), opacity 200ms ease",
            willChange: "transform",
          }}
        />

        {TABS.map(({ to, label, Icon }, i) => {
          const isDotTab = i === index;
          const isRouteTab = i === routeIndex;

          if (to === "/profile") {
            return (
              <button
                key={to}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                aria-label={label}
                title={label}
                aria-current={isRouteTab ? "page" : undefined}
                onClick={() => {
                  setAutoplay(false);
                  if (user) navigate("/profile");
                  else if (onProfileGate) onProfileGate();
                }}
                className={tabClass(isDotTab)}
              >
                <Icon size={22} strokeWidth={2} aria-hidden="true" />
              </button>
            );
          }

          return (
            <Link
              key={to}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              to={to}
              aria-label={label}
              title={label}
              aria-current={isRouteTab ? "page" : undefined}
              onClick={() => setAutoplay(false)}
              className={tabClass(isDotTab)}
            >
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
