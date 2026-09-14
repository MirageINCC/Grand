/**
 * Must match server/src/config.ts's MAP_SIZE — the coordinate space Leaflet's
 * CRS.Simple uses (see map/MapView.tsx). Zoom 0 of the generated tile pyramid
 * is always exactly one MAP_SIZE x MAP_SIZE tile, so this never needs to change.
 */
export const MAP_SIZE = 256;

/**
 * Set this to the MAX_ZOOM value printed by `npm run tiles` after generating
 * the tile pyramid (server/scripts/generate-tiles.ts) for your map image.
 */
export const MAP_MAX_ZOOM = 5;
