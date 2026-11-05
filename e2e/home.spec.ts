import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("DocuHealth");
  await expect(
    page.getByRole("heading", { name: /Nigeria’s First Centralized Healthcare Platform/i }),
  ).toBeVisible();
});

test("unknown paths show the 404 page", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Go home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("design system page shows the colors and type roles", async ({ page }) => {
  await page.goto("/design-system");
  await expect(page.getByText("Primary/Blue", { exact: true })).toBeVisible();
  await expect(page.getByText("#3e4095", { exact: true })).toBeVisible();
  await expect(page.getByText("Heading/H1", { exact: true })).toBeVisible();
});
