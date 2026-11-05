# Kingsley Junior Norku — Professional Career Platform

A recruiter-focused professional profile and CV platform built with React, TypeScript, Vite, and Tailwind CSS. The application presents career experience, recruiter-oriented CV tracks, professional documents, and contact information through a responsive web experience.

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Vitest
- Cloudflare Workers Static Assets

## Local development

```sh
npm ci
npm run dev
```

The development server is configured for port `8080` and binds to the local loopback interface rather than exposing the development server to the network.

## Quality checks

Run the same checks used by the repository's GitHub Actions quality workflow:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The CI quality gate also performs a high-severity audit of production/runtime dependencies with `npm audit --omit=dev --audit-level=high`.

## Dependency security

The repository uses npm lockfile pinning and explicit dependency overrides for patched transitive `nanoid` and `postcss` versions. These overrides are intentionally narrow and should be revisited when their upstream dependency chains provide compatible fixes.

Dependency install scripts are governed by an explicit, version-pinned `allowScripts` policy in `package.json`, while `.npmrc` enables strict enforcement so newly introduced install scripts must be reviewed before CI will accept them.

Do not use `npm audit fix --force` as a routine maintenance operation. Review the affected dependency chain first, prefer the smallest compatible patch, refresh `package-lock.json`, and run the complete quality suite before merging.

## Production build

```sh
npm run build
```

Vite outputs the production application to `dist/`.

## Cloudflare Workers deployment

The project is configured for Cloudflare Workers Static Assets through `wrangler.jsonc`. The configuration publishes the Vite `dist/` directory and enables SPA fallback so client-side routes resolve through `index.html` when a matching static asset does not exist.

If deploying from a local environment with Wrangler installed, use:

```sh
npm run build
wrangler deploy
```

For Cloudflare Workers Builds, configure the project to build the application with `npm run build` and deploy the resulting Worker/static assets using the repository's `wrangler.jsonc` configuration.

## Repository workflow

- `main` is the stable integration branch.
- `career-update-vehicle-accounting` is the active development branch for recruiter-focused career platform enhancements.
- Keep production-facing changes validated by lint, typecheck, tests, and a production build before merging.
- Keep dependency changes lockfile-synchronized, install-script reviewed, and security-audited before review.

## Content integrity

Professional positioning is based on documented experience and transferable skills. The platform does not claim prior remote employment or invent vehicle-accounting employment history.


## Canonical site origin and SEO

The canonical production origin defaults to `https://hr-catalyst-five.vercel.app`, matching the repository's configured homepage. If the production domain changes, set `VITE_SITE_URL` in the build environment (without a trailing slash) so the generated `sitemap.xml`, the sitemap directive in generated `robots.txt`, and route-level canonical/Open Graph URLs use the same origin. Update the static root metadata in `index.html` at the same time.
