type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { box: string; radius: string }> = {
  sm: { box: "h-9 w-9", radius: "rounded-xl" },
  md: { box: "h-12 w-12", radius: "rounded-2xl" },
  lg: { box: "h-20 w-20", radius: "rounded-2xl" },
};

export function AppLogo({
  size = "sm",
  showGlow = false,
  className = "",
}: {
  size?: Size;
  showGlow?: boolean;
  className?: string;
}) {
  const { box, radius } = SIZES[size];

  return (
    <div className={`relative ${box} ${className}`}>
      {showGlow && (
        <div className={`absolute inset-0 scale-150 ${radius} bg-[#ff6b2b]/25 blur-xl`} />
      )}
      <svg
        className={`relative ${box} ${radius} shadow-lg shadow-orange-950/40`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="logo-bg" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff8f4c" />
            <stop offset="1" stopColor="#ff3d00" />
          </linearGradient>
          <linearGradient id="logo-line" x1="6" y1="28" x2="34" y2="14" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#logo-bg)" />
        <rect
          width="40"
          height="40"
          rx="10"
          fill="white"
          fillOpacity="0.12"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 65%)" }}
        />
        <path
          d="M5 27.5 L11 27.5 L14.5 17 L18.5 31 L22.5 13 L26.5 23.5 L35 23.5"
          stroke="url(#logo-line)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22.5" cy="13" r="2" fill="white" />
      </svg>
    </div>
  );
}
