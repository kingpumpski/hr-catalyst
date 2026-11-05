import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    // Keep the development server local by default; Codespaces can still forward the port.
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2019",
    sourcemap: false,
    cssCodeSplit: true,
    // Allow Rollup/Vite to form shared chunks from the actual static and
    // dynamic import graph. Broad manual vendor buckets previously grouped
    // every Radix primitive and icon into eagerly shared bundles, reducing
    // the benefit of route-level lazy loading.
    chunkSizeWarningLimit: 600,
  },
}));
