import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dev-time proxy so the browser sees everything as same-origin (cookies just work),
// matching how the built app is served in production (one Express origin for
// API + auth + tiles + static client, see server/src/index.ts).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/auth": "http://localhost:3000",
      "/tiles": "http://localhost:3000",
    },
  },
});
