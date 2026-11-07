import { expect, test } from "@playwright/test";

test("platform administration redirects unauthenticated visitors to sign-in", async ({ page }) => {
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\?next=%2Fadmin/);
  await expect(page.getByRole("heading", { name: "Sign in to HR Catalyst" })).toBeVisible();
});
