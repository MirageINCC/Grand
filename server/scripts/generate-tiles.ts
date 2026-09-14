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

  const sourceBuffer = await readFile(input);
  const metadata = await sharp(sourceBuffer).metadata();
  const { width, height } = metadata;
  if (!width || !height) throw new Error("Could not read source image dimensions");

  const maxDim = Math.max(width, height);
  const maxZoom = Math.max(0, Math.ceil(Math.log2(maxDim / tileSize)));
  const paddedSize = tileSize * 2 ** maxZoom;

  console.log(`Source: ${width}x${height}px -> padded canvas: ${paddedSize}x${paddedSize}px, maxZoom=${maxZoom}`);

  const paddedBuffer = await sharp(sourceBuffer)
    .extend({
      top: 0,
      left: 0,
      bottom: paddedSize - height,
      right: paddedSize - width,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  for (let z = maxZoom; z >= 0; z--) {
    const size = tileSize * 2 ** z;
    const tilesPerSide = size / tileSize;
    const zoomed = await sharp(paddedBuffer).resize(size, size, { fit: "fill" }).toBuffer();

    for (let x = 0; x < tilesPerSide; x++) {
      const dir = path.join(output, String(z), String(x));
      await mkdir(dir, { recursive: true });
      for (let y = 0; y < tilesPerSide; y++) {
        await sharp(zoomed)
          .extract({ left: x * tileSize, top: y * tileSize, width: tileSize, height: tileSize })
          .toFile(path.join(dir, `${y}.png`));
      }
    }
    console.log(`  z=${z}: ${tilesPerSide * tilesPerSide} tiles written`);
  }

  console.log("");
  console.log(`Done. Set MAP_MAX_ZOOM=${maxZoom} in client/src/config.ts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
