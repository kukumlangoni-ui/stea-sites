import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, LayoutGrid, Star, User } from "lucide-react";

/**
 * Native-iOS bottom bar. Mobile only (hidden from lg up, where the sidebar
 * rail takes over navigation). Routes map 1:1 to real pages — no dead tabs.
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

export default function SitesMobileTabBar({ user, onProfileGate } = {}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/85 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-black/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-14 items-center justify-around px-2 pt-2">
        {TABS.map(({ to, label, Icon, isActive }) => {
          const active = isActive(pathname);
          const cls = `flex flex-col items-center gap-1 transition-colors duration-200 ${
            active
              ? "text-amber-500 dark:text-[#F5A623]"
              : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          }`;

          // Profile is gated: guests get the member sheet instead of a dead route
          if (to === "/profile") {
            return (
              <button
                key={to}
                type="button"
                onClick={() => (user ? navigate("/profile") : onProfileGate && onProfileGate())}
                className={cls}
                aria-label="Profile"
              >
                <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          }

          return (
            <Link key={to} to={to} aria-current={active ? "page" : undefined} className={cls}>
              <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* iOS home indicator */}
      <div className="mx-auto mb-1 mt-2 h-1 w-32 rounded-full bg-slate-900/80 dark:bg-white" />
    </nav>
  );
}
