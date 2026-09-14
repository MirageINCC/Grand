/**
 * The side length of the coordinate space used by the map, in "world units".
 * This matches the tile size (256) at zoom 0 of the generated tile pyramid
 * (see scripts/generate-tiles.ts): zoom 0 is always exactly one 256x256 tile,
 * regardless of source image resolution. Marker x/y are stored in this
 * [0, MAP_SIZE] x [0, MAP_SIZE] space, so it never needs to change even if
 * the source map image is swapped out for a higher-resolution one later.
 */
export const MAP_SIZE = 256;
