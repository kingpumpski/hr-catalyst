import { expect, test } from "@playwright/test";

test("public portfolio renders without uncaught browser errors", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.locator("main")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("CV library loads, filters career tracks, and has the corrected heading", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  const response = await page.goto("/cv");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Recruiter Documents" })).toBeVisible();

  const search = page.getByRole("textbox", { name: "Search CV versions" });
  await search.fill("claims");
  await expect(page.getByText(/Showing \d+ of \d+ career tracks/)).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("private referee vault redirects unauthenticated visitors to sign-in", async ({ page }) => {
  const response = await page.goto("/owner/referees");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\?next=/);
  await expect(page.getByRole("heading", { name: "Sign in to HR Catalyst" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Account access is not configured");
});
