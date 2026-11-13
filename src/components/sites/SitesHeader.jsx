import SteaLogo from "./SteaGlobeMark.jsx";
import { useState, memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, Sun, Moon, ArrowRight } from "lucide-react";
import { useSitesLanguage } from "../../i18n/index.js";
import { usePWA } from "../../contexts/PWAContext.jsx";
import { useSettings } from "../../contexts/SettingsContext.jsx";
import SitesMemberMenu from "./SitesMemberMenu.jsx";

const LOGO = "/stea-www-globe.png"; // Official STEA logo

function HeaderInstallButton() {
  const { deferredPrompt, isInstalled } = usePWA();
  const { t } = useSitesLanguage();
  if (isInstalled || !deferredPrompt) return null;

  return (
    <button
      type="button"
      className="hidden h-8 shrink-0 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-bold text-amber-600 transition-colors duration-200 hover:border-amber-500/60 hover:bg-amber-500/20 dark:text-[#F5A623] md:inline-flex"
      onClick={() => deferredPrompt.prompt()}
      aria-label={t("nav.installApp", "Install App")}
      title={t("nav.installApp", "Install App")}
    >
      <Download size={13} strokeWidth={2.5} />
      <span>{t("nav.installApp", "Install App")}</span>
    </button>
  );
}

function AccountButton({ user, onSignIn }) {
  const { t } = useSitesLanguage();
  const [clicked, setClicked] = useState(false);

  if (user) {
    return <SitesMemberMenu user={user} />;
  }

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
    if (onSignIn) onSignIn();
    else window.dispatchEvent(new CustomEvent("open-auth"));
  };

  return (
    <button
      type="button"
      className={[
        "stea-member-pill group relative flex h-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full",
        "pl-5 pr-[46px] text-sm font-bold tracking-tight",
        "bg-slate-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        "dark:bg-white dark:text-black dark:shadow-[0_4px_12px_rgba(255,255,255,0.15)]",
        "transition-all duration-300 ease-in-out hover:scale-105 active:scale-95",
      ].join(" ")}
      onClick={handleClick}
      aria-label={t("nav.signIn", "Sign In")}
      title={t("nav.signIn", "Sign In")}
    >
      <span className="stea-member-label relative z-0">{t("nav.becomeMember", "Become a Member")}</span>
      <span
        aria-hidden="true"
        className="stea-member-chip absolute right-1 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-slate-900 shadow-[0_1px_6px_rgba(0,0,0,0.28)] dark:bg-slate-900 dark:text-white dark:shadow-[0_1px_6px_rgba(0,0,0,0.35)]"
      >
        <ArrowRight size={16} strokeWidth={2.5} className="stea-member-arrow" />
      </span>
    </button>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  // We need to know the rendered mode if it's 'system'
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (theme === "light") setIsDark(false);
    else if (theme === "dark") setIsDark(true);
    else {
      setIsDark(
        !(
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: light)").matches
        )
      );
    }
  }, [theme]);

  return (
    <button
      type="button"
      className={[
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "border border-slate-300 bg-slate-100 text-slate-600",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_4px_rgba(15,23,42,0.12)]",
        "dark:border-white/10 dark:bg-[#1C1C1E] dark:text-zinc-400",
        "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]",
        "transition-colors duration-200 hover:text-slate-900 dark:hover:text-white",
      ].join(" ")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun size={18} strokeWidth={2.2} /> : <Moon size={18} strokeWidth={2.2} />}
    </button>
  );
}

function SitesHeader({ user, onSignIn, onSignOut }) {
  const { t } = useSitesLanguage();

  return (
    <header
      role="banner"
      className={[
        /* fixed 64px bar — page content is offset by 64px in the page styles */
        "fixed inset-x-0 top-0 z-[1000] flex h-16 w-full items-center justify-between gap-3",
        "border-b border-slate-200/70 px-4 md:px-6",
        /* iOS glass */
        "bg-white/80 backdrop-blur-2xl",
        "dark:border-white/10 dark:bg-black/60",
        "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]",
        "transition-colors duration-300",
      ].join(" ")}
    >
      {/* ── Brand: 3D gold/black icon tile + wordmark ── */}
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2.5 text-slate-900 no-underline dark:text-white"
        aria-label="STEA Home"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#111] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.35)]">
          <SteaLogo size={24} className="h-6 w-6 text-[#F5A623]" />
        </span>
        <span className="text-[18px] font-bold tracking-tight">STEA</span>
      </Link>

      {/* ── Actions: install (desktop) · theme · member. No language switcher. ── */}
      <div
        className="flex min-w-0 items-center gap-2 md:gap-3"
        aria-label={t("nav.headerActions", "Header actions")}
      >
        <HeaderInstallButton />
        <ThemeToggle />
        <AccountButton user={user} onSignIn={onSignIn} />
      </div>
    </header>
  );
}

export default memo(SitesHeader);
