import { expect, test, type Page } from "@playwright/test";

const localOrigin = "http://127.0.0.1:4173";

const watchBrowserFailures = (page: Page) => {
  const pageErrors: string[] = [];
  const failedResponses: string[] = [];

  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("response", response => {
    if (response.url().startsWith(localOrigin) && response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  return () => {
    expect(pageErrors, "uncaught browser exceptions").toEqual([]);
    expect(failedResponses, "failed same-origin asset or route responses").toEqual([]);
  };
};

test("public portfolio renders without browser or asset errors", async ({ page }) => {
  const assertNoBrowserFailures = watchBrowserFailures(page);

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.locator("main")).toBeVisible();
  assertNoBrowserFailures();
});

test("CV library loads, filters career tracks, and has the corrected heading", async ({ page }) => {
  const assertNoBrowserFailures = watchBrowserFailures(page);

  const response = await page.goto("/cv");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Recruiter Documents" })).toBeVisible();

  const search = page.getByRole("textbox", { name: "Search CV versions" });
  await search.fill("claims");
  await expect(page.getByText(/Showing \d+ of \d+ career tracks/)).toBeVisible();
  assertNoBrowserFailures();
});

test("private referee vault redirects unauthenticated visitors to sign-in", async ({ page }) => {
  const assertNoBrowserFailures = watchBrowserFailures(page);

  const response = await page.goto("/owner/referees");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\?next=/);
  await expect(page.getByRole("heading", { name: "Sign in to HR Catalyst" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Account access is not configured");
  assertNoBrowserFailures();
});

test("canonical, Open Graph, and structured-data URLs use the verified production hostname", async ({ page }) => {
  const assertNoBrowserFailures = watchBrowserFailures(page);

  await page.goto("/");
  const canonicalUrl = "https://hr-catalyst-five.vercel.app/";
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonicalUrl);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonicalUrl);

  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  expect(structuredData).toBeTruthy();
  expect(JSON.parse(structuredData ?? "{}").url).toBe("https://hr-catalyst-five.vercel.app");
  assertNoBrowserFailures();
});

test("platform administration is protected and unauthenticated visitors are sent to sign-in", async ({ page }) => {
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\?next=%2Fadmin/);
  await expect(page.getByRole("heading", { name: "Sign in to HR Catalyst" })).toBeVisible();
});
