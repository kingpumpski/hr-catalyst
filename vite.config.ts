import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import tailwindcss from "@tailwindcss/vite";
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/react-router/") ||
            id.includes("/node_modules/react-router-dom/")
          ) {
            return "vendor";
          }

          if (id.includes("/node_modules/@radix-ui/")) return "radix-vendor";
          if (id.includes("/node_modules/lucide-react/")) return "icons-vendor";
          if (id.includes("/node_modules/framer-motion/")) return "motion-vendor";
          if (id.includes("/node_modules/next-themes/")) return "theme-vendor";
          if (id.includes("/node_modules/sonner/")) return "toast-vendor";

          if (
            id.includes("/node_modules/react-pdf/") ||
            id.includes("/node_modules/pdfjs-dist/") ||
            id.includes("/node_modules/html2canvas/")
          ) {
            return "document-export-vendor";
          }

          if (id.includes("/node_modules/recharts/")) return "charts-vendor";
          if (
            id.includes("/node_modules/react-hook-form/") ||
            id.includes("/node_modules/@hookform/resolvers/") ||
            id.includes("/node_modules/zod/")
          ) {
            return "forms-vendor";
          }
        },
      },
    },
  },
}));
