import L from "leaflet";

const cache = new Map<string, L.DivIcon>();

/** A simple colored pin, so each category is visually distinguishable on the map. */
export function categoryIcon(color: string): L.DivIcon {
  const cached = cache.get(color);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "category-marker-icon",
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z" fill="${color}" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });

  cache.set(color, icon);
  return icon;
}
