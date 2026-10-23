import React from "react";

// Logo officiel fourni par l'utilisateur (utilisé tel quel, sans modification)
const LOGO_DARK = "https://customer-assets-7cd3h4nn.emergentagent.net/job_corridor-dating/artifacts/klhk12q5_IMG_0797.jpeg";
const LOGO_LIGHT = "https://customer-assets-7cd3h4nn.emergentagent.net/job_corridor-dating/artifacts/fs0hp629_IMG_0798.jpeg";

export function Logo({ size = 40, withText = false, stacked = false, variant = "dark", className = "" }) {
  const src = variant === "light" ? LOGO_LIGHT : LOGO_DARK;

  if (stacked) {
    return (
      <div className={`flex flex-col items-center ${className}`} data-testid="app-logo">
        <img src={src} alt="Diaspora Love Connect" width={size} height={size}
          className="object-contain mix-blend-lighten" style={{ width: size, height: size }} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid="app-logo">
      <img src={src} alt="Diaspora Love Connect" width={size} height={size}
        className="rounded-full object-cover ring-1 ring-[hsl(var(--gold))]/40"
        style={{ width: size, height: size }} />
      {withText && (
        <span className="gold-gradient-text hidden font-serif text-lg font-bold tracking-[0.06em] leading-none whitespace-nowrap sm:inline">
          DIASPORA LOVE CONNECT
        </span>
      )}
    </div>
  );
}

export { LOGO_DARK, LOGO_LIGHT };
export default Logo;
