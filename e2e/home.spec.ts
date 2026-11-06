import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("DocuHealth");
  await expect(
    page.getByRole("heading", { name: /Nigeria’s First Centralized Healthcare Platform/i }),
  ).toBeVisible();
});

for (const { name, width, height } of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`navbar stays at the top while scrolling on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");

    await page.locator("footer").scrollIntoViewIfNeeded();

    const box = await page.getByRole("banner").boundingBox();
    expect(box?.y).toBe(0);
  });
}

test("mobile menu links scroll to their section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "FAQ", exact: true }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page).toHaveURL(/#faq$/);
  await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeInViewport();
});

test("mobile menu has a log in link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/login$/);
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
