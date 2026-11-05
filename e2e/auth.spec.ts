import { expect, test } from "@playwright/test";

// Each section of the app lives on its own subdomain (src/lib/sections.ts).
const main = "http://localhost:4173";
const hospital = "http://hospital.localhost:4173";
const agent = "http://agent.localhost:4173";

test("login validates the form and links to the other auth pages", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("Log in · DocuHealth");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();

  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Choose your account type" })).toBeVisible();
});

test("sign-up asks for the account type before the form", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Choose an account type")).toBeVisible();

  await page.getByText("Health Provider").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(`${hospital}/register`);
  await expect(page.getByLabel("Organization name")).toBeVisible();
});

test("password reset: email, code, then a new password", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  await page.getByLabel("Email address").fill("ada@example.com");
  await page.getByRole("button", { name: "Send code" }).click();

  await expect(page.getByText("we sent to ada@example.com")).toBeVisible();
  await page.keyboard.type("123456");
  await page.getByRole("button", { name: "Verify" }).click();

  await expect(page.getByRole("heading", { name: "Create new password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Password123!");
  await page.getByLabel("Confirm new password").fill("Password123!");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page).toHaveURL(`${main}/login`);
  await expect(page.getByText("Password updated. Log in with your new password.")).toBeVisible();
});

test("individual sign-up step 1 validates and offers a switch to provider", async ({ page }) => {
  await page.goto("/register?type=individual");
  await expect(page.getByText("Step 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter your first name")).toBeVisible();
  await expect(page.getByText("Select a gender")).toBeVisible();
  await expect(page.getByText("Accept the Terms and Privacy Policy to continue")).toBeVisible();

  await page.getByRole("link", { name: "Switch" }).click();
  await expect(page).toHaveURL(`${hospital}/register`);
});

test("individual sign-up step 2 verifies the email code", async ({ page }) => {
  await page.goto("/register?type=individual");
  await page.getByLabel("First name").fill("Ada");
  await page.getByLabel("Last name").fill("Okonkwo");
  await page.getByLabel("Gender").click();
  await expect(page.getByRole("option", { name: "Prefer not to say" })).toBeVisible();
  await page.getByRole("option", { name: "Female" }).click();
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Phone Number").fill("+2348012345678");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Step 2 of 3")).toBeVisible();
  await expect(page.getByText("we sent to ada@example.com")).toBeVisible();
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText("Enter the 6-digit code", { exact: true })).toBeVisible();

  // "Change" goes back to step 1 with the answers still filled in.
  await page.getByRole("button", { name: "Change" }).click();
  await expect(page.getByText("Step 1 of 3")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue("ada@example.com");
});

test("individual sign-up step 3 registers and shows the HIN", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/register?type=individual");
  await page.getByLabel("First name").fill("Ada");
  await page.getByLabel("Last name").fill("Okonkwo");
  await page.getByLabel("Gender").click();
  await page.getByRole("option", { name: "Female" }).click();
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Phone Number").fill("+2348012345678");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
  await page.keyboard.type("123456");
  await page.getByRole("button", { name: "Verify" }).click();

  await expect(page.getByText("Step 3 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByText("Enter your 11-digit NIN")).toBeVisible();

  await page.getByRole("textbox", { name: "NIN", exact: true }).fill("123-456-789-01");
  await page.getByLabel(/^Password/).fill("Password123!");
  await page.getByLabel("Confirm Password").fill("Password123!");
  await page.getByRole("button", { name: "Register" }).click();

  const dialog = page.getByRole("dialog", { name: "Account Created!" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Copy HIN" }).click();
  await expect(page.getByText("HIN copied", { exact: true })).toBeVisible();
  expect(await page.evaluate("navigator.clipboard.readText()")).toBe("123456789");
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("provider sign-up validates the facility details", async ({ page }) => {
  await page.goto(`${hospital}/register`);
  await expect(page.getByRole("heading", { name: "Register your facility" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Select at least one organisation type")).toBeVisible();
  await expect(page.getByText("Enter your organisation's name")).toBeVisible();

  await page.getByLabel("Organisation Type").click();
  await page.getByRole("option", { name: "Hospital/Clinic" }).click();
  await page.getByRole("option", { name: "Pharmacy/Chemist" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Organisation Type")).toContainText(
    "Hospital/Clinic, Pharmacy/Chemist",
  );

  await page.getByRole("link", { name: "Switch" }).click();
  await expect(page).toHaveURL(`${main}/register?type=individual`);
});

test("provider sign-up submits the application", async ({ page }) => {
  await page.goto(`${hospital}/register`);
  await page.getByLabel("Organisation Type").click();
  await page.getByRole("option", { name: "Hospital/Clinic" }).click();
  await page.keyboard.press("Escape");
  await page.getByLabel("Organization name").fill("Lagos University Teaching Hospital");
  await page.getByLabel("Official Email").fill("admin@luth.example.com");
  await page.getByLabel("Phone Number").fill("+2348023456789");
  await page.getByRole("button", { name: "Continue" }).click();

  const dialog = page.getByRole("dialog", { name: "Application submitted!" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(page).toHaveURL(`${main}/`);
});

test("facility verification: documents, then admin details", async ({ page }) => {
  await page.goto(`${hospital}/verify`);
  await expect(page.getByRole("heading", { name: "Link expired" })).toBeVisible();

  await page.goto(`${hospital}/verify?token=abc123`);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Upload at least one document")).toBeVisible();

  await page.locator("#documents").setInputFiles([
    { name: "cac-certificate.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF") },
    { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hi") },
  ]);
  await expect(page.getByText("cac-certificate.pdf")).toBeVisible();
  await expect(page.getByText("Use PDF, JPG or PNG files")).toBeVisible();

  await page.getByRole("button", { name: "Remove notes.txt" }).click();
  await expect(page.getByText("Use PDF, JPG or PNG files")).toBeHidden();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("Step 2 of 2")).toBeVisible();
  await page.getByRole("button", { name: "Register hospital" }).click();
  await expect(page.getByText("Enter the admin's first name")).toBeVisible();
  await page.getByLabel("First name").fill("Tunde");
  await page.getByLabel("Last name").fill("Adeyemi");
  await page.getByLabel("Email address").fill("tunde@luth.example.com");
  await page.getByLabel("Phone number").fill("+2348034567890");
  await page.getByRole("button", { name: "Register hospital" }).click();

  const dialog = page.getByRole("dialog", { name: "Hospital Registered!" });
  await expect(dialog).toContainText("We’ve emailed Tunde at tunde@luth.example.com");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(page).toHaveURL(`${main}/`);
});

test("field agent registers a hospital in three steps", async ({ page }) => {
  await page.goto(`${agent}/register-hospital`);
  await expect(page.getByText("Step 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Select at least one facility type")).toBeVisible();

  await page.getByLabel("Hospital name").fill("Havannah Hospital");
  await page.getByLabel("Facility type").click();
  await page.getByRole("option", { name: "Hospital/Clinic" }).click();
  await page.getByRole("option", { name: "Laboratory only" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Facility type")).toContainText("Hospital/Clinic, Laboratory only");
  await page.getByLabel("Ownership").click();
  await page.getByRole("option", { name: "Private" }).click();
  await page.getByLabel("CAC RC number").fill("RC 1234567");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Step 2 of 3")).toBeVisible();
  await page.getByLabel("State").fill("Lagos");
  await page.getByLabel("LGA").fill("Ikeja");
  await page.getByLabel("Street address").fill("12 Allen Avenue");
  await page.getByLabel("Hospital phone").fill("+2348056789012");
  await page.getByLabel("Hospital email").fill("hello@havannah.example.com");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Step 3 of 3")).toBeVisible();
  await page.getByLabel("First name").fill("Tunde");
  await page.getByLabel("Last name").fill("Adeyemi");
  await page.getByLabel("Email address").fill("tunde@havannah.example.com");
  await page.getByLabel("Phone number").fill("+2348034567890");
  await page.getByRole("button", { name: "Register hospital" }).click();

  const dialog = page.getByRole("dialog", { name: "Hospital Registered!" });
  await expect(dialog).toContainText(
    "Havannah Hospital has been added to DocuHealth. We’ve emailed Tunde at tunde@havannah.example.com",
  );
});

test("hospital login validates the form and links to registration", async ({ page }) => {
  await page.goto(`${hospital}/`);
  await expect(page).toHaveURL(`${hospital}/login`);
  await expect(page).toHaveTitle("Hospital log in · DocuHealth");
  await expect(page.getByRole("heading", { name: "Log in to your facility" })).toBeVisible();
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Enter your password")).toBeVisible();

  await page.getByRole("link", { name: "Register your facility" }).click();
  await expect(page).toHaveURL(`${hospital}/register`);

  await page.goto(`${hospital}/login`);
  await page.getByRole("link", { name: "Switch" }).click();
  await expect(page).toHaveURL(`${main}/login`);
});

test("hospital password reset: email, code, then a new password", async ({ page }) => {
  await page.goto(`${hospital}/login`);
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(`${hospital}/forgot-password`);
  await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();

  await page.getByLabel("Email address").fill("admin@luth.example.com");
  await page.getByRole("button", { name: "Send code" }).click();
  await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
  await expect(page.getByText("we sent to admin@luth.example.com")).toBeVisible();

  // "Change" goes back to the email with it still filled in.
  await page.getByRole("button", { name: "Change" }).click();
  await expect(page.getByLabel("Email address")).toHaveValue("admin@luth.example.com");
  await page.getByRole("button", { name: "Send code" }).click();

  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText("Enter the 6-digit code", { exact: true })).toBeVisible();
  await page.keyboard.type("123456");
  await page.getByRole("button", { name: "Verify" }).click();

  await expect(page.getByRole("heading", { name: "Create new password" })).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill("Password123!");
  await page.getByLabel("Confirm new password").fill("Password124!");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByText("Passwords do not match")).toBeVisible();

  await page.getByLabel("Confirm new password").fill("Password123!");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page).toHaveURL(`${hospital}/login`);
  await expect(page.getByText("Password updated. Log in with your new password.")).toBeVisible();
});
