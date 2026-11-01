import { expect, type Page, test } from "@playwright/test";

async function signIn(page: Page, password = "password123") {
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("signed-out users are sent to sign-in, then back where they were going", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in\?redirect=/);

  await signIn(page);

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
});

test("wrong password shows the API's error", async ({ page }) => {
  await page.goto("/sign-in");
  await signIn(page, "not-the-password");
  await expect(page.getByRole("alert")).toHaveText("Wrong email or password");
});

test("signing out returns to sign-in and protects the app again", async ({ page }) => {
  await page.goto("/sign-in");
  await signIn(page);
  await page.getByRole("button", { name: /Sign out/ }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in\?redirect=/);
});
