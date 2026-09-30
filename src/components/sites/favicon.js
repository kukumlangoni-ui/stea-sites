/**
 * Favicon resolver + hostname/domain normalization helpers.
 *
 * Priority order for favicon lookups:
 *   1. stored faviconUrl if given
 *   2. DuckDuckGo icon endpoint (clean, simple)
 *   3. Google s2 favicon (fallback) — sz=256 for retina
 *   4. direct /favicon.ico guess
 *   5. globe SVG fallback (always available)
 *
 * These are pure functions + one async resolver.
 * Imported by WebsiteIcon, SitesFavicon, and admin flows.
 */

/* ── Globe SVG fallback — inline data URL, zero network ── */
const GLOBE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">' +
  '<circle cx="32" cy="32" r="28" stroke="rgba(245,166,35,0.55)" stroke-width="2"/>' +
  '<ellipse cx="32" cy="32" rx="11" ry="28" stroke="rgba(245,166,35,0.35)" stroke-width="1.5"/>' +
  '<line x1="4" y1="32" x2="60" y2="32" stroke="rgba(245,166,35,0.35)" stroke-width="1.5"/>' +
  '<path d="M20 20 Q32 14 44 20 Q50 30 44 42 Q32 50 20 42 Q14 30 20 20 Z" stroke="rgba(245,166,35,0.45)" stroke-width="1.5"/>' +
  '<circle cx="32" cy="32" r="3" fill="rgba(245,166,35,0.7)"/>' +
  '</svg>';

export const GLOBE_FAVICON_DATA_URL =
  "data:image/svg+xml;utf8," + encodeURIComponent(GLOBE_SVG);

export function extractHostname(urlOrHost) {
  if (!urlOrHost) return "";
  const raw = String(urlOrHost).trim();
  if (!raw) return "";
  try {
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
    const u = new URL(hasProtocol ? raw : `https://${raw}`);
    return (u.hostname || "").replace(/^www\./i, "");
  } catch {
    return raw.replace(/^www\./i, "").toLowerCase();
  }
}

export function normalizeUrl(url) {
  if (!url) return "";
  const raw = String(url).trim();
  if (!raw) return "";
  try {
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
    const u = new URL(hasProtocol ? raw : `https://${raw}`);
    return u.toString();
  } catch {
    return raw.startsWith("http") ? raw : `https://${raw}`;
  }
}

export function protocolOf(url) {
  try {
    const u = new URL(normalizeUrl(url));
    return u.protocol.replace(":", "");
  } catch {
    return "https";
  }
}

/**
 * Build a priority list of candidate favicon URLs for a given site.
 * Caller iterates them on error.
 */
export function buildFaviconCandidates({ faviconUrl, url, domain }) {
  const host = extractHostname(domain || url);
  const out = [];
  if (faviconUrl) out.push({ src: faviconUrl, weight: 0 });
  if (host) {
    // DDG first — simple, privacy-friendly, usually square clean icons
    out.push({ src: `https://icons.duckduckgo.com/ip3/${host}.ico`, weight: 1 });
    // Google fallback — sz=256 for retina crispness
    out.push({ src: `https://www.google.com/s2/favicons?domain=${host}&sz=256`, weight: 2 });
    // Also try /favicon.ico last as a raw guess
    out.push({ src: `https://${host}/favicon.ico`, weight: 3 });
  }
  // Globe SVG is the final fallback — always works, zero network
  out.push({ src: GLOBE_FAVICON_DATA_URL, weight: 99, isFallback: true });
  return out;
}

/**
 * Async resolver — tries each candidate with a 4s timeout per source.
 * Returns the first URL that loads successfully within the timeout window.
 * Falls back to the globe SVG data URL if everything else fails.
 *
 * Caches successful results in localStorage under "stea_sites_favicon_cache_v2"
 * so repeat visits are instant.
 */
const CACHE_KEY = "stea_sites_favicon_cache_v2";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SOURCE_TIMEOUT_MS = 4000;

let cacheLoaded = false;
const memoryCache = new Map();

function loadCache() {
  if (cacheLoaded) return;
  cacheLoaded = true;
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    const now = Date.now();
    for (const [k, v] of Object.entries(parsed)) {
      if (v && v.url && (!v.ts || now - v.ts < CACHE_TTL_MS)) {
        memoryCache.set(k, v);
      }
    }
  } catch {}
}

let persistTimer = null;
function saveCache() {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const obj = {};
      for (const [k, v] of memoryCache.entries()) obj[k] = v;
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch {}
  }, 300);
}

function testImageWithTimeout(src, timeoutMs) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    let timer = null;

    const finish = (ok) => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };

    timer = setTimeout(() => finish(false), timeoutMs);
    img.onload = () => finish(img.naturalWidth > 0);
    img.onerror = () => finish(false);
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.src = src;
  });
}

/**
 * Resolve a working favicon URL asynchronously with per-source timeout.
 * Uses cached result if available.
 *
 * @param {{faviconUrl?:string, url?:string, domain?:string}} opts
 * @returns {Promise<string>} working favicon URL (globe SVG if all fail)
 */
export async function getFaviconUrl(opts = {}) {
  loadCache();
  const { faviconUrl, url, domain } = opts || {};
  const host = extractHostname(domain || url) || "";
  const cacheKey = `${host}||${String(faviconUrl || "")}`;

  // Check cache first
  if (cacheKey && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.url) return cached.url;
  }

  const candidates = buildFaviconCandidates({ faviconUrl, url, domain: host });

  for (const candidate of candidates) {
    // Globe fallback is always valid — return immediately
    if (candidate.isFallback) {
      if (cacheKey) {
        memoryCache.set(cacheKey, { url: candidate.src, ts: Date.now() });
        saveCache();
      }
      return candidate.src;
    }
    // eslint-disable-next-line no-await-in-loop
    const ok = await testImageWithTimeout(candidate.src, SOURCE_TIMEOUT_MS);
    if (ok) {
      if (cacheKey) {
        memoryCache.set(cacheKey, { url: candidate.src, ts: Date.now() });
        saveCache();
      }
      return candidate.src;
    }
  }

  // Should never reach here since globe is always last, but just in case
  return GLOBE_FAVICON_DATA_URL;
}

/**
 * Derive a sensible default display name from a URL.
 *
 *   "https://docs.pika.art/guide" → "Pika"
 *   "https://www.netflix.com"     → "Netflix"
 */
export function deriveNameFromUrl(url) {
  const host = extractHostname(url);
  if (!host) return "";
  const root = host.split(".").slice(-2, -1)[0] || host.split(".")[0] || host;
  if (!root) return "";
  return root.charAt(0).toUpperCase() + root.slice(1);
}

/** Deterministic small glyph color palette for letter-fallback tiles. */
const FALLBACK_PALETTE = [
  ["#F5A623", "#1a1105"],
  ["#8B7BFA", "#110e22"],
  ["#4AA3FF", "#06121f"],
  ["#EF6A6A", "#1e0a0a"],
  ["#56C28A", "#071a11"],
  ["#FF8F3D", "#1d0f04"],
  ["#34C9C0", "#041616"],
  ["#F26FB2", "#1f0815"],
];

export function pickFallbackPalette(seedText) {
  const s = String(seedText || "?");
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
}

export function siteLetter(name, domain) {
  const raw = (name || domain || "").trim();
  return raw ? raw.charAt(0).toUpperCase() : "?";
}

/* ========================= FAVICON CACHING LAYER =========================
 * resolveFavicon — cheap, cached resolution for the full pipeline.
 * Priority order:
 *   1. existing valid stored faviconUrl (given as input)
 *   2. duckduckgo ip3
 *   3. Google s2 (sz=256)
 *   4. /favicon.ico
 *   5. globe SVG fallback — ALWAYS available
 *
 * Rules:
 *   - No fetch() / page body downloads (CORS blocked anyway). Only candidate URLs.
 *   - Cached in-process by (hostname+faviconUrl) key. Persisted to localStorage
 *     under "stea_sites_favicon_cache_v2" with 7-day TTL.
 *   - Never blocks card rendering — returns synchronously. The <img onerror>
 *     pipeline uses buildFaviconCandidates to try subsequent candidates.
 * ========================================================================== */

const IN_PROCESS_CACHE = new Map();
const LS_KEY = "stea_sites_favicon_cache_v2";

function loadPersistentCache() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    for (const [k, v] of Object.entries(parsed)) {
      if (!IN_PROCESS_CACHE.has(k)) IN_PROCESS_CACHE.set(k, v);
    }
  } catch {}
}

function savePersistentCache() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const obj = {};
    for (const [k, v] of IN_PROCESS_CACHE.entries()) obj[k] = v;
    window.localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch {}
}

export function resetFaviconCache() {
  IN_PROCESS_CACHE.clear();
  try { if (typeof window !== "undefined") window.localStorage.removeItem(LS_KEY); } catch {}
}

/**
 * @param {{faviconUrl?:string, url?:string, domain?:string, name?:string}} opts
 * @returns {{
 *   url?:string, candidates:Array<{src:string,weight:number}>,
 *   fallback?:boolean, letter:string, palette:[string,string]
 * }}
 */
export function resolveFavicon(opts = {}) {
  loadPersistentCache();
  const { faviconUrl, url, domain, name } = opts || {};
  const host = extractHostname(domain || url) || "";
  const key = `${host}||${String(faviconUrl || "")}`;
  const letter = siteLetter(name, host);
  const palette = pickFallbackPalette(letter || host || "?");
  if (IN_PROCESS_CACHE.has(key)) {
    const cached = IN_PROCESS_CACHE.get(key);
    return { ...cached, letter, palette };
  }
  const candidates = buildFaviconCandidates({ faviconUrl, url, domain: host });
  const firstUrl = candidates[0]?.src || "";
  const result = {
    url: firstUrl || undefined,
    candidates: candidates.map(c => ({ src: c.src, weight: c.weight, isFallback: c.isFallback })),
    letter,
    palette,
  };
  IN_PROCESS_CACHE.set(key, result);
  savePersistentCache();
  return result;
}
