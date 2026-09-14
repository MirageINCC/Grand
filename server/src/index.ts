import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import express from "express";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { categoriesRouter } from "./routes/categories.js";
import { markersRouter } from "./routes/markers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In the built image this is /app/dist -> ../public and ../tiles resolve to /app/public and /app/tiles
// (see server/Dockerfile). In dev these directories may not exist yet — that's fine, the API still works.
const publicDir = path.join(__dirname, "..", "public");
const tilesDir = path.join(__dirname, "..", "tiles");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/markers", markersRouter);

app.use("/tiles", express.static(tilesDir, { maxAge: "7d", immutable: true }));
app.use(express.static(publicDir));

// SPA fallback: any non-API, non-tiles GET that didn't match a static file serves index.html.
app.get(/^(?!\/(api|auth|tiles)\/).*/, (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) res.status(404).send("Not found (client build missing — run `npm run build`)");
  });
});

app.listen(env.PORT, () => {
  console.log(`gta-map server listening on :${env.PORT}`);
});
