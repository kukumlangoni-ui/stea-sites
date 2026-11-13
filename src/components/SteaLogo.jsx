import React from 'react';
import GlobeMark from "./sites/SteaGlobeMark.jsx";

/**
 * Legacy brand lockup (used by Navbar / older pages).
 * The mark is now the shared, mathematically clean STEA globe SVG —
 * no bitmap favicon, no letter fallback.
 */
export default function SteaLogo({ size = 'md', hideText = false, tone = "light" }) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const px = sizes[size] || 36;
  const shouldHideText = hideText || size === 'sm';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <GlobeMark
        size={px}
        className="stea-brand-mark"
        style={{ flexShrink: 0, color: '#F5A623' }}
      />
      {!shouldHideText && (
        <span style={{
          fontSize: px * 0.55, fontWeight: 900,
          color: tone === "dark" ? '#0F172A' : '#FFFFFF', letterSpacing: -0.5,
          fontFamily: 'system-ui'
        }}>
          STEA
        </span>
      )}
    </div>
  );
}
