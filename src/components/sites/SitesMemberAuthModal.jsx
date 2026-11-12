/**
 * SitesMemberAuthModal — Premium Authentication Modal for STEA
 *
 * Lazy-loaded. Zero impact on public critical bundle.
 *
 * Supports:
 *  - Continue with Google (popup preferred, redirect fallback)
 *  - Continue with Email (sign in / register / forgot password)
 *  - Creates user profile in Firestore users/{uid} with role:"member"
 *  - Dark glass STEA design
 */
import { memo, useCallback, useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import SteaLogo from "./SteaGlobeMark.jsx";


function SitesMemberAuthModal({ open = true, onClose, onUser }) {
  const [mounted, setMounted] = useState(Boolean(open));
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(timer);
    }
    setMounted(true);
    setError("");
    setSuccess("");
    const r = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(r);
  }, [open]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      onClose && onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => { if (e.key === "Escape" && !loading) handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, loading, handleClose]);

  // Capture Google Redirect Result if browser returned from signInWithRedirect
  useEffect(() => {
    let active = true;
    const captureRedirect = async () => {
      try {
        const { getFirebaseAuth, getRedirectResult } = await import("../../firebase.js");
        const auth = getFirebaseAuth();
        if (!auth) return;
        const result = await getRedirectResult(auth);
        if (result && result.user && active) {
          await saveUserProfile(result.user, result.user.displayName, "google");
          handleClose();
        }
      } catch (err) {
        console.warn("Redirect result error:", err);
        if (active) setError(getErrorMsg(err));
      }
    };
    captureRedirect();
    return () => {
      active = false;
    };
  }, [handleClose]);

  const getErrorMsg = (err) => {
    if (!err) return "Something went wrong. Please try again.";
    const code = err?.code || "";
    const map = {
      "auth/popup-blocked": "Your browser blocked the login popup. Redirecting to Google to sign in...",
      "auth/invalid-credential": "Email or password is incorrect. Please double-check your credentials.",
      "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
      "auth/wrong-password": "Incorrect password. Please try again or reset your password.",
      "auth/user-not-found": "No account found with this email. Please register.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password must be at least 6 characters long.",
      "auth/network-request-failed": "Network error. Please check your internet connection.",
      "auth/too-many-requests": "Too many attempts. Please wait a moment before trying again.",
      "auth/popup-closed-by-user": "Google sign-in window was closed.",
      "auth/cancelled-popup-request": "Sign-in request was cancelled.",
      "auth/user-disabled": "This user account has been disabled.",
      "auth/requires-recent-login": "Please log in again to continue.",
      "auth/unauthorized-domain": "This domain is not authorized for sign in.",
      "auth/operation-not-allowed": "This sign-in provider is not enabled in Firebase.",
    };
    if (map[code]) return map[code];

    if (typeof err?.message === "string") {
      const clean = err.message
        .replace(/^Firebase:\s*(?:Error\s*)?(?:\([^)]+\)\s*:?)?/i, "")
        .replace(/\(auth\/[a-z0-9-]+\)\.?/i, "")
        .trim();
      if (clean) return clean;
    }
    return "Something went wrong. Please try again.";
  };

  const saveUserProfile = async (user, displayName, provider) => {
    try {
      const { getFirebaseDb, doc, getDoc, setDoc, serverTimestamp, isAdminEmail } = await import("../../firebase.js");
      const db = getFirebaseDb();
      if (!db) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          name: displayName || user.displayName || "",
          email: user.email || "",
          role: "member",
          provider,
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          source: "stea_sites",
        });
      }
      const data = snap.exists() ? snap.data() : {};
      const role = isAdminEmail(user.email) ? "super_admin" : (data.role || "member");
      if (onUser) onUser({ uid: user.uid, email: user.email, displayName: displayName || user.displayName, photoURL: user.photoURL, role });
    } catch (e) {
      console.error("Failed to save user profile:", e);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { getFirebaseAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import("../../firebase.js");
      const auth = getFirebaseAuth();
      if (!auth) {
        setError("Firebase authentication is currently unavailable. Please try again later.");
        setLoading(false);
        return;
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        const result = await signInWithPopup(auth, provider);
        await saveUserProfile(result.user, result.user.displayName, "google");
        handleClose();
      } catch (popupErr) {
        const code = popupErr?.code || "";
        if (code === "auth/popup-blocked") {
          setError("Your browser blocked the login popup. Redirecting to Google to sign in...");
          setTimeout(async () => {
            try {
              await signInWithRedirect(auth, provider);
            } catch (redirErr) {
              setError(getErrorMsg(redirErr));
              setLoading(false);
            }
          }, 600);
          return;
        }
        throw popupErr;
      }
    } catch (e) {
      setError(getErrorMsg(e));
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password) { setError("Please enter your password."); return; }
    if (mode === "register") {
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirmPw) { setError("Passwords do not match."); return; }
    }
    setLoading(true); setError("");
    try {
      const { getFirebaseAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("../../firebase.js");
      const auth = getFirebaseAuth();
      if (!auth) { setError("Firebase not available."); return; }
      let result;
      if (mode === "login") {
        result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      }
      await saveUserProfile(result.user, name || result.user.displayName, "email");
      handleClose();
    } catch (e) {
      setError(getErrorMsg(e));
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError("Please enter your email to reset password."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const { getFirebaseAuth, sendPasswordResetEmail } = await import("../../firebase.js");
      const auth = getFirebaseAuth();
      if (!auth) { setError("Firebase not available."); return; }
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setSuccess("Password reset link sent to your email!");
    } catch (e) {
      setError(getErrorMsg(e));
    } finally { setLoading(false); }
  };

  const switchMode = (m) => { setMode(m); setError(""); setSuccess(""); };

  if (!mounted) return null;

  const fieldClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 " +
    "placeholder:text-slate-400 outline-none transition-all " +
    "focus:border-amber-500 focus:ring-1 focus:ring-amber-500 " +
    "dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white dark:placeholder:text-zinc-600";

  const labelClass = "mb-1.5 block text-xs font-bold text-slate-700 dark:text-zinc-300";

  const primaryClass =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-bold text-black " +
    "shadow-[0_4px_14px_rgba(245,166,35,0.3)] transition-all hover:scale-[1.02] hover:bg-amber-400 " +
    "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sites-auth-title"
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/80"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 180ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={[
          "relative w-full max-w-sm overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6",
          "shadow-2xl dark:border-white/10 dark:bg-[#1C1C1E] sm:p-8",
          "text-slate-900 dark:text-white",
        ].join(" ")}
        style={{
          maxHeight: "90vh",
          transform: visible ? "scale(1)" : "scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "opacity 180ms ease, transform 200ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-zinc-400 dark:hover:bg-white/20"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* ── Header: clean SVG brand mark ── */}
        <div className="mb-6 text-center">
          <div
            className={[
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] text-[#F5A623]",
              "border border-slate-200 bg-white shadow-sm",
              "dark:border-white/10 dark:bg-[#151515] dark:shadow-lg dark:shadow-black/50",
            ].join(" ")}
          >
            <SteaLogo size={34} />
          </div>
          <h2
            id="sites-auth-title"
            className="m-0 text-[22px] font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {mode === "forgot" ? "Reset Password" : mode === "register" ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="m-0 mt-1 text-[13px] font-semibold text-slate-500 dark:text-zinc-400">
            STEA <span className="text-amber-500">Sites</span>
          </p>
        </div>

        {/* ── iOS segmented control ── */}
        {mode !== "forgot" && (
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {["login", "register"].map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={[
                    "flex-1 rounded-lg py-2 text-center text-sm transition-all",
                    active
                      ? "bg-white font-bold text-slate-900 shadow-sm dark:bg-[#2C2C2E] dark:text-white"
                      : "font-medium text-slate-500 dark:text-zinc-400",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Messages ── */}
        {error && (
          <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-300">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            <CheckCircle size={15} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {mode === "forgot" ? (
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelClass} htmlFor="stea-forgot-email">Email</label>
              <input
                id="stea-forgot-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                autoComplete="email"
              />
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className={`${primaryClass} mt-3`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="mx-auto px-2 py-2 text-[13px] font-semibold text-amber-500 transition-colors hover:text-amber-600"
            >
              ← Back to Sign In
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className={[
                "mt-1 flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-semibold transition-colors",
                "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                "dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5",
                loading ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              {loading ? (
                <span>Connecting to Google…</span>
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    width={18}
                    height={18}
                    alt=""
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-2 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Name (register only) */}
            {mode === "register" && (
              <div>
                <label className={labelClass} htmlFor="stea-auth-name">Full Name</label>
                <input
                  id="stea-auth-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className={labelClass} htmlFor="stea-auth-email">Email</label>
              <input
                id="stea-auth-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>

            {/* Password */}
            <div>
              <label className={labelClass} htmlFor="stea-auth-password">Password</label>
              <div className="relative">
                <input
                  id="stea-auth-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${fieldClass} pr-11`}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  onKeyDown={(e) => { if (e.key === "Enter" && mode === "login") handleEmailAuth(); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 p-1.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div>
                <label className={labelClass} htmlFor="stea-auth-confirm">Confirm Password</label>
                <input
                  id="stea-auth-confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className={fieldClass}
                  autoComplete="new-password"
                  onKeyDown={(e) => { if (e.key === "Enter") handleEmailAuth(); }}
                />
              </div>
            )}

            {/* Forgot password */}
            {mode === "login" && (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="-mt-0.5 self-end px-0.5 py-1 text-xs font-medium text-amber-500 transition-colors hover:text-amber-600"
              >
                Forgot password?
              </button>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleEmailAuth}
              disabled={loading}
              className={`${primaryClass} mt-3`}
            >
              {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(SitesMemberAuthModal);
