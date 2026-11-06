import { defineConfig, mergeConfig, type UserConfig } from "vitest/config";
import baseConfig from "./vite.config";

export default defineConfig(async (env) => {
  const base = typeof baseConfig === "function" ? await baseConfig(env) : baseConfig;
  return mergeConfig(base as UserConfig, {
    test: {
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/e2e/**",
      ],
    },
  });
});
