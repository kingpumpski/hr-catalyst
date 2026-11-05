// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = process.env.VITE_SITE_URL || "https://hr-catalyst-five.vercel.app";

const readSlugs = (file) =>
  Array.from(readFileSync(resolve(file), "utf8").matchAll(/slug:\s*"([a-z0-9-]+)"/g)).map((match) => match[1]);

const slugs = Array.from(new Set([
  ...readSlugs("src/data/cvVersions.ts"),
  ...readSlugs("src/data/cvCatalog.ts"),
]));

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/cv", changefreq: "weekly", priority: "0.9" },
  ...slugs.map((slug) => ({ path: `/cv/${slug}`, changefreq: "monthly", priority: "0.8" })),
];

const urls = entries.map((entry) => [
  "  <url>",
  `    <loc>${BASE_URL}${entry.path}</loc>`,
  entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
  entry.priority ? `    <priority>${entry.priority}</priority>` : null,
  "  </url>",
].filter(Boolean).join("\n"));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), sitemap);
console.log(`sitemap.xml written (${entries.length} entries)`);
