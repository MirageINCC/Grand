import L from "leaflet";

const cache = new Map<string, L.DivIcon>();

/**
 * Darkens a hex color by a fraction, for the pin's gradient/stroke — keeps
 * every category's icon visually consistent (same shape, same shading
 * treatment) while still being clearly distinguishable by its own hue.
 */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 0xff) * (1 - amount));
  const g = clamp(((n >> 8) & 0xff) * (1 - amount));
  const b = clamp((n & 0xff) * (1 - amount));
  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
}

/** A colored teardrop pin with a soft drop shadow and a subtle top-to-bottom
 *  gradient, so each category reads clearly on the map without looking flat. */
export function categoryIcon(color: string): L.DivIcon {
  const cached = cache.get(color);
  if (cached) return cached;

  const gradientId = `pin-gradient-${cache.size}`;
  const shadowId = `pin-shadow-${cache.size}`;
  const dark = shade(color, 0.35);

  const icon = L.divIcon({
    className: "category-marker-icon",
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${dark}"/>
        </linearGradient>
        <filter id="${shadowId}" x="-50%" y="-20%" width="200%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" flood-color="#000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path
        d="M15 2C8.4 2 3 7.4 3 14c0 9 12 22 12 22s12-13 12-22c0-6.6-5.4-12-12-12z"
        fill="url(#${gradientId})"
        stroke="${dark}"
        stroke-width="1.5"
        filter="url(#${shadowId})"
      />
      <circle cx="15" cy="14" r="5.5" fill="#fff" fill-opacity="0.95"/>
      <circle cx="15" cy="14" r="5.5" fill="none" stroke="${dark}" stroke-width="1"/>
    </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });

  cache.set(color, icon);
  return icon;
}
