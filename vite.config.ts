import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("@radix-ui")) return "radix-vendor";
          if (id.includes("lucide-react")) return "icons-vendor";
          if (id.includes("framer-motion")) return "motion-vendor";
          if (id.includes("next-themes")) return "theme-vendor";
          if (id.includes("sonner")) return "toast-vendor";
        },
      },
    },
  },
}));
