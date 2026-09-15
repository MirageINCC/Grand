/**
 * Slices a source map image into a Leaflet-compatible slippy-map tile pyramid
 * (output/{z}/{x}/{y}.png), for use with L.CRS.Simple on the client.
 *
 * The source image is never resized to "fit" a fixed canvas — instead it is padded
 * (transparent) up to the next power-of-two-times-tileSize square. This makes zoom 0
 * *always* exactly one tileSize x tileSize tile, regardless of the source image's
 * resolution or aspect ratio, so the client's coordinate space (L.CRS.Simple bounds
 * [[0,0],[tileSize,tileSize]]) never has to change even if the source image is later
 * replaced (e.g. with a higher-resolution version of the same map).
 *
 * Usage:
 *   npm run tiles -- --input ./my-gta5-map.png --output ./server/tiles [--tileSize 256]
 *
 * You must supply your own map image — GTA V map artwork is Rockstar's property and
 * is not bundled with this project.
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      args.set(key, value);
      i++;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = args.get("input");
  const output = args.get("output");
  const tileSize = Number(args.get("tileSize") ?? 256);

  if (!input || !output) {
    console.error("Usage: npm run tiles -- --input <image> --output <dir> [--tileSize 256]");
    process.exit(1);
  }

  // Source/output images here can comfortably exceed sharp's default safety
  // limit (~268 megapixels, meant to guard against decompression-bomb-style
  // uploads) — this is a local, admin-run tool operating on a map image the
  // admin chose themselves, not an untrusted upload, so that guard is disabled
  // throughout.
  const sharpOpts = { limitInputPixels: false } as const;

  const sourceBuffer = await readFile(input);
  const metadata = await sharp(sourceBuffer, sharpOpts).metadata();
  const { width, height } = metadata;
  if (!width || !height) throw new Error("Could not read source image dimensions");

  const maxDim = Math.max(width, height);
  const maxZoom = Math.max(0, Math.ceil(Math.log2(maxDim / tileSize)));
  const paddedSize = tileSize * 2 ** maxZoom;

  console.log(`Source: ${width}x${height}px -> padded canvas: ${paddedSize}x${paddedSize}px, maxZoom=${maxZoom}`);

  // Built via create+composite rather than sharp's .extend() — extend()
  // rejects any single side over 10000px, which a non-square source (far
  // from square, needing lots of one-sided padding) can easily exceed.
  const paddedBuffer = await sharp({
    create: {
      width: paddedSize,
      height: paddedSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
    ...sharpOpts,
  })
    .composite([{ input: sourceBuffer, top: 0, left: 0 }])
    .png()
    .toBuffer();

  // Report the real map content's extent within the [0, MAP_SIZE] world-unit
  // space the client uses (see client/src/config.ts) — everything beyond it,
  // out to paddedSize, is transparent padding, not part of the map. Needed so
  // the client can keep panning/zoom-to-fill bounded to the actual map rather
  // than the padded square (only matters when width != height).
  const contentWidthUnits = (width / paddedSize) * tileSize;
  const contentHeightUnits = (height / paddedSize) * tileSize;

  for (let z = maxZoom; z >= 0; z--) {
    const size = tileSize * 2 ** z;
    const tilesPerSide = size / tileSize;

    // Decode the zoom level's image to raw pixels *once* and slice tiles out
    // of that in-memory buffer, instead of re-decoding the whole (up to
    // paddedSize x paddedSize) PNG from scratch for every single tile — with
    // thousands of tiles at the higher zoom levels that redundant full-image
    // decode dominated runtime (minutes, for a large non-square source).
    const { data: raw, info } = await sharp(paddedBuffer, sharpOpts)
      .resize(size, size, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let x = 0; x < tilesPerSide; x++) {
      const dir = path.join(output, String(z), String(x));
      await mkdir(dir, { recursive: true });
      await Promise.all(
        Array.from({ length: tilesPerSide }, (_, y) =>
          sharp(raw, { raw: { width: info.width, height: info.height, channels: info.channels }, ...sharpOpts })
            .extract({ left: x * tileSize, top: y * tileSize, width: tileSize, height: tileSize })
            .png()
            .toFile(path.join(dir, `${y}.png`))
        )
      );
    }
    console.log(`  z=${z}: ${tilesPerSide * tilesPerSide} tiles written`);
  }

  console.log("");
  console.log(`Done. Set in client/src/config.ts:`);
  console.log(`  MAP_MAX_ZOOM=${maxZoom}`);
  if (width !== height) {
    console.log(`  MAP_CONTENT_WIDTH=${contentWidthUnits}`);
    console.log(`  MAP_CONTENT_HEIGHT=${contentHeightUnits}`);
    console.log(`(source wasn't square — everything beyond that content size, out to MAP_SIZE, is transparent padding)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
