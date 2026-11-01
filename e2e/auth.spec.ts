import { expect, type Page, test } from "@playwright/test";

async function signIn(page: Page, email: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("signed-out users are sent to sign-in, then back where they were going", async ({ page }) => {
  await page.goto("/contacts");
  await expect(page).toHaveURL(/\/sign-in\?redirect=/);

  await signIn(page, "member@example.com");

  await expect(page).toHaveURL(/\/contacts$/);
  await expect(page.getByRole("cell", { name: "Grace Hopper" })).toBeVisible();
});

test("wrong password shows the API's error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toHaveText("Wrong email or password");
});

test("only admins can open /admin", async ({ page }) => {
  await page.goto("/sign-in");
  await signIn(page, "member@example.com");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("add a contact", async ({ page }) => {
  await page.goto("/sign-in");
  await signIn(page, "admin@example.com");
  await page.getByRole("link", { name: "Contacts" }).click();

  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByRole("button", { name: "Add contact" }).click();

  await expect(page.getByText("Ada Lovelace added")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Ada Lovelace" })).toBeVisible();
});
