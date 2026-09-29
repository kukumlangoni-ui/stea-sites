/**
 * STEA — Sites Application Router (stea.africa)
 *
 * Master discovery directory for websites.
 * Backend: Firebase Auth + Firestore (swahilitecheliteacademy)
 */
import React, { Suspense, lazy, Component, useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { WebsitesDataProvider } from "./context/WebsitesDataContext.jsx";
import { SitesLanguageProvider } from "./i18n/index.js";
import { PWAProvider } from "./contexts/PWAContext.jsx";
import { SettingsProvider } from "./contexts/SettingsContext.jsx";
import { useAuth } from "./hooks/useAuth.js";

const WebsiteSolutionsPage = lazy(() => import("./pages/WebsiteSolutionsPage.jsx"));
const SitesMemberAuthModal = lazy(() => import("./components/sites/SitesMemberAuthModal.jsx"));
const SuggestWebsiteModal = lazy(() => import("./components/sites/SuggestWebsiteModal.jsx"));
const AgeGateModal = lazy(() => import("./components/sites/AgeGateModal.jsx"));
const WebsiteDetailPage = lazy(() => import("./pages/WebsiteDetailPage.jsx"));
const AfterDarkPage = lazy(() => import("./pages/AfterDarkPage.jsx"));
const SitesAdminApp = lazy(() => import("./sites/admin/SitesAdminApp.jsx"));
const SitesNotFoundPage = lazy(() => import("./pages/SitesNotFoundPage.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy.jsx"));
import CookieConsentBanner from "./components/shared/CookieConsentBanner.jsx";
import { useConsentGatedScripts } from "./hooks/useConsentGatedScripts.js";

class LocalErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("STEA Sites Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", backgroundColor: "#080c14",
          color: "#fff", padding: "24px", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
          <h2 style={{ color: "#F5A623" }}>Something went wrong</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 500 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button onClick={() => window.location.reload()}
            style={{ padding: "10px 20px", borderRadius: "10px", background: "#F5A623",
              color: "#000", fontWeight: 700, border: "none", cursor: "pointer" }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageLoadingFallback() {
  return <div style={{ minHeight: '60vh', background: '#05060a' }} />;
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  useConsentGatedScripts();

  const [authOpen, setAuthOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [ageGateOpen, setAgeGateOpen] = useState(false);

  useEffect(() => {
    const onOpenAuth = () => setAuthOpen(true);
    const onOpenSuggest = () => {
      const activeUser = user || (typeof window !== "undefined" && window._steaAuthUser);
      if (!activeUser && !authLoading) setAuthOpen(true);
      else setSuggestOpen(true);
    };
    const onOpenAgeGate = () => setAgeGateOpen(true);
    window.addEventListener("open-auth", onOpenAuth);
    window.addEventListener("open-suggest-site", onOpenSuggest);
    window.addEventListener("open-age-gate", onOpenAgeGate);
    return () => {
      window.removeEventListener("open-auth", onOpenAuth);
      window.removeEventListener("open-suggest-site", onOpenSuggest);
      window.removeEventListener("open-age-gate", onOpenAgeGate);
    };
  }, [user, authLoading]);

  return (
    <LocalErrorBoundary>
      <SettingsProvider>
        <SitesLanguageProvider>
          <WebsitesDataProvider>
            <PWAProvider>
              <div className="stea-master-root" style={{ minHeight: "100vh", background: "#080c14", overflow: "visible" }}>
                <CookieConsentBanner />
                {authOpen && (
                  <Suspense fallback={null}>
                    <SitesMemberAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
                  </Suspense>
                )}
                {suggestOpen && (
                  <Suspense fallback={null}>
                    <SuggestWebsiteModal open={suggestOpen} onClose={() => setSuggestOpen(false)} user={user} />
                  </Suspense>
                )}
                {ageGateOpen && (
                  <Suspense fallback={null}>
                    <AgeGateModal open={ageGateOpen} onClose={() => setAgeGateOpen(false)} />
                  </Suspense>
                )}
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<WebsiteSolutionsPage />} />
                    <Route path="/websites" element={<WebsiteSolutionsPage />} />
                    <Route path="/websites/:category" element={<WebsiteSolutionsPage />} />
                    <Route path="/website-solutions" element={<Navigate to="/websites" replace />} />
                    <Route path="/website-solutions/:category" element={<WebsiteSolutionsPage />} />
                    <Route path="/site/:slug" element={<WebsiteDetailPage />} />
                    <Route path="/after-dark" element={<AfterDarkPage />} />
                    <Route path="/websites/after-dark" element={<AfterDarkPage />} />
                    <Route path="/mature" element={<AfterDarkPage />} />

                    {/* Legacy redirects — Code paths now live at code.stea.africa */}
                    <Route path="/code" element={<Navigate to="https://code.stea.africa" replace />} />
                    <Route path="/code/*" element={<Navigate to="https://code.stea.africa" replace />} />
                    <Route path="/products/*" element={<Navigate to="https://code.stea.africa" replace />} />
                    <Route path="/developers" element={<Navigate to="https://code.stea.africa" replace />} />
                    <Route path="/dev" element={<Navigate to="https://code.stea.africa" replace />} />

                    {/* Admin */}
                    <Route path="/admin/*" element={<SitesAdminApp />} />
                    <Route path="/admin" element={<Navigate to="/admin/" replace />} />

                    {/* Legacy redirects */}
                    <Route path="/classroom" element={<Navigate to="/" replace />} />
                    <Route path="/classroom/*" element={<Navigate to="/" replace />} />
                    <Route path="/alpha" element={<Navigate to="/" replace />} />
                    <Route path="/alpha/*" element={<Navigate to="/" replace />} />
                    <Route path="/attendance" element={<Navigate to="/" replace />} />
                    <Route path="/attendance/*" element={<Navigate to="/" replace />} />
                    <Route path="/marketplace" element={<Navigate to="/" replace />} />
                    <Route path="/duka" element={<Navigate to="/" replace />} />
                    <Route path="/chaba" element={<Navigate to="/" replace />} />
                    <Route path="/seller" element={<Navigate to="/" replace />} />
                    <Route path="/seller/*" element={<Navigate to="/" replace />} />
                    <Route path="/creators" element={<Navigate to="/" replace />} />
                    <Route path="/creators/*" element={<Navigate to="/" replace />} />
                    <Route path="/gigs" element={<Navigate to="/" replace />} />
                    <Route path="/jobs" element={<Navigate to="/" replace />} />
                    <Route path="/menu" element={<Navigate to="/" replace />} />
                    <Route path="/utilities" element={<Navigate to="/" replace />} />

                    {/* Legal */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/cookie-policy" element={<Navigate to="/cookies" replace />} />

                    <Route path="*" element={<SitesNotFoundPage />} />
                  </Routes>
                </Suspense>
              </div>
            </PWAProvider>
          </WebsitesDataProvider>
        </SitesLanguageProvider>
      </SettingsProvider>
    </LocalErrorBoundary>
  );
}
