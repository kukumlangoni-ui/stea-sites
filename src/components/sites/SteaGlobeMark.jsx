/**
 * SteaGlobeMark — clean, scalable STEA globe mark.
 * Inherits color from `currentColor` so it works on light and dark surfaces.
 */
export const SteaLogo = ({ size = 32, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C12 2 15 6 15 12C15 18 12 22 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 2C12 2 9 6 9 12C9 18 12 22 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default SteaLogo;
