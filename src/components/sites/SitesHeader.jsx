import { useState, memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { CircleUser, Check, ChevronDown, Download, Sun, Moon } from "lucide-react";
import { TOKENS } from "./tokens.js";
import { useSitesLanguage, SUPPORTED_LANGUAGES } from "../../i18n/index.js";
import { usePWA } from "../../contexts/PWAContext.jsx";
import { useSettings } from "../../contexts/SettingsContext.jsx";
import SitesMemberMenu from "./SitesMemberMenu.jsx";

const LOGO = "/stea-www-globe.png"; // Official STEA logo

const LANG_SHORT = {
  en: "EN",
  sw: "SW",
  zh: "中文",
};

const LANG_LABEL = {
  en: "English",
  sw: "Swahili",
  zh: "Simplified Chinese",
};

function LanguageChip() {
  const { currentLang, changeLanguage } = useSitesLanguage();
  const [open, setOpen] = useState(false);

  const displayKey = currentLang === 'en' ? 'en' : currentLang === 'zh' ? 'zh' : currentLang === 'sw' ? 'sw' : 'en';

  return (
    <div className="sites-lang-chip-wrap" onMouseLeave={() => setOpen(false)}>
      <button 
        type="button"
        className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-200/70 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/15"
        onClick={() => setOpen(!open)}
        aria-label="Change Language"
        title="Change Language"
      >
        <span>{LANG_SHORT[displayKey] || "EN"}</span>
        <ChevronDown size={11} strokeWidth={2.5} className="opacity-70" />
      </button>
      {open && (
        <ul className="sites-lang-menu">
          {["en", "sw", "zh"].map((k) => (
            <li key={k}>
              <button
                type="button"
                className={`sites-lang-option ${displayKey === k ? "is-selected" : ""}`}
                onClick={() => { changeLanguage(k); setOpen(false); }}
              >
                <span>{LANG_LABEL[k]}</span>
                {displayKey === k && <Check size={12} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HeaderInstallButton() {
  const { deferredPrompt, isInstalled } = usePWA();
  const { t } = useSitesLanguage();
  if (isInstalled || !deferredPrompt) return null;

  return (
    <button 
      type="button"
      className="sites-header-install-btn"
      onClick={() => deferredPrompt.prompt()}
      aria-label={t("nav.installApp", "Install App")}
      title={t("nav.installApp", "Install App")}
    >
      <Download size={13} strokeWidth={2.5} />
      <span className="sites-header-install-text">{t("nav.installApp", "Install App")}</span>
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
    else window.dispatchEvent(new CustomEvent('open-auth'));
  };

  return (
    <button
      type="button"
      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:scale-105 hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
      onClick={handleClick}
      aria-label={t("nav.signIn", "Sign In")}
      title={t("nav.signIn", "Sign In")}
    >
            {t("nav.becomeMember", "Become a Member")}
    </button>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  // We need to know actual rendered mode if it's 'system'
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (theme === 'light') setIsDark(false);
    else if (theme === 'dark') setIsDark(true);
    else {
      setIsDark(!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches));
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors duration-200 hover:bg-slate-200/70 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/15"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun size={15} strokeWidth={2.5} /> : <Moon size={15} strokeWidth={2.5} />}
    </button>
  );
}

function SitesHeader({ user, onSignIn, onSignOut }) {
  const { t } = useSitesLanguage();

  return (
    <header className="sites-header-v2" role="banner">
      <div className="sites-header-v2-inner">
        <Link
          to="/"
          className="sites-brand-v2"
          aria-label="STEA Home"
        >
          <img
            src={LOGO}
            alt="STEA logo"
            className="sites-brand-v2-logo"
            width="32"
            height="32"
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
          <span className="sites-brand-v2-text">STEA</span>
        </Link>

        <div className="sites-header-v2-right" aria-label={t("nav.headerActions", "Header actions")}>
          <HeaderInstallButton />
          <LanguageChip />
          <ThemeToggle />
          <AccountButton user={user} onSignIn={onSignIn} />
        </div>
      </div>

      <style>{`
        .sites-header-v2 {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 56px;
          flex-shrink: 0;
          z-index: 1000;
          background: var(--stea-header-bg);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid var(--stea-header-border);
          box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -8px rgba(15, 23, 42, 0.10);
          transition: background-color 300ms ease-in-out,
                      border-color 300ms ease-in-out,
                      box-shadow 300ms ease-in-out;
          overflow: visible;
        }

        .sites-header-v2-inner {
          max-width: 1440px;
          height: 100%;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .sites-brand-v2 {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--stea-text);
          flex-shrink: 0;
        }

        .sites-brand-v2-logo {
          width: 26px;
          height: 26px;
          border-radius: 0; background: transparent;
          display: block;
          object-fit: contain;
        }

        .sites-brand-v2-text {
          font-family: "'Bricolage Grotesque', 'Instrument Sans', system-ui, -apple-system, sans-serif";
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: var(--stea-text);
        }

        .sites-header-v2-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .sites-header-install-btn {
          appearance: none;
          border: 1px solid color-mix(in srgb, var(--stea-gold) 28%, var(--stea-border));
          background: color-mix(in srgb, var(--stea-gold) 10%, transparent);
          color: var(--stea-gold-hi);
          border-radius: 999px;
          padding: 5px 12px;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: background 140ms ease, border-color 140ms ease;
        }
        .sites-header-install-btn:hover {
          background: color-mix(in srgb, var(--stea-gold) 20%, transparent);
          border-color: var(--stea-gold);
        }


        .sites-lang-chip-wrap {
          position: relative;
        }


        .sites-lang-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 130px;
          background: var(--stea-panel2);
          border: 1px solid var(--stea-border-hi);
          border-radius: 10px;
          padding: 4px;
          list-style: none;
          margin: 0;
          z-index: var(--stea-z-toast, 80);
          box-shadow: 0 12px 28px rgba(0,0,0,0.5);
        }

        .sites-lang-option {
          appearance: none;
          background: transparent;
          border: 0;
          width: 100%;
          text-align: left;
          padding: 6px 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font: inherit;
          font-size: 12px;
          color: var(--stea-text2);
          cursor: pointer;
        }
        .sites-lang-option:hover {
          background: rgba(255,255,255,0.06);
          color: var(--stea-text);
        }
        .sites-lang-option.is-selected {
          color: var(--stea-gold-hi);
          font-weight: 750;
        }


        /* Native-app feel: no Install CTA on phones, it belongs to desktop */
        @media (max-width: 767px) {
          .sites-header-install-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

export default memo(SitesHeader);
