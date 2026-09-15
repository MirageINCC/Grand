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
export const MAP_MAX_ZOOM = 6;

/**
 * The real map content's width/height within the [0, MAP_SIZE] world, in the
 * same units — everything beyond this, out to MAP_SIZE, is transparent
 * padding the tile generator added to reach a power-of-two square (see the
 * comment in generate-tiles.ts). Only differs from MAP_SIZE when the source
 * image wasn't square; the script prints the values to use here. Used to
 * keep panning/the fill-viewport zoom (MapView.tsx) bounded to the actual
 * map instead of the padded square.
 */
export const MAP_CONTENT_WIDTH = 96;
export const MAP_CONTENT_HEIGHT = 144;
