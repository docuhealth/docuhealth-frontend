import { expect, test } from "@playwright/test";

// The hospital section lives on its own subdomain (src/lib/sections.ts); data comes from the
// mock API (src/mocks/receptionist.ts).
const hospital = "http://hospital.localhost:4173";

test("dashboard greets the receptionist and shows today's numbers", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  await expect(page).toHaveTitle("Dashboard · DocuHealth");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Kemi");
  await expect(page.getByText("LUTH", { exact: true })).toBeVisible();

  const overview = page.getByRole("region", { name: "Overview" });
  await expect(overview.getByText("2,486")).toBeVisible();
  await expect(overview.getByText("vs. last 7 days")).toBeVisible();
});

test("appointment tabs and search filter the list", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  const today = page.getByRole("list", { name: "Today’s appointments" });
  await expect(today.getByRole("listitem")).toHaveCount(5);
  await expect(today.getByText("Daniel Martins")).toBeVisible();

  await page.getByRole("tab", { name: /Tomorrow/ }).click();
  await expect(page.getByText("Kelechi Nnamdi")).toBeVisible();
  await expect(page.getByText("Daniel Martins")).toBeHidden();

  await page.getByLabel("Search appointments").fill("nobody");
  await expect(page.getByText("No appointments match “nobody”.")).toBeVisible();
});

test("checking a patient out takes them off the queue", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  await expect(page.getByText("Chinonso Okafor")).toBeVisible();

  await page.getByRole("button", { name: "Check out Chinonso Okafor" }).click();
  const dialog = page.getByRole("dialog", { name: "Check-out Patient" });
  // Their doctor's follow-up request waits to be settled first.
  await expect(dialog.getByText("Follow-up visit")).toBeVisible();
  await dialog.getByRole("button", { name: "Confirm" }).click();
  await expect(dialog.getByText("Confirmed", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Complete Check-out" }).click();
  await expect(page.getByText("Chinonso Okafor is checked out.")).toBeVisible();
  await expect(page.getByRole("cell", { name: /Chinonso Okafor/ })).toBeHidden();
  // The next in line moves up into the card.
  await expect(page.getByText("Hauwa Garba")).toBeVisible();
});

test("sidebar reaches the receptionist's other sections", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  await page.getByRole("link", { name: "Appointments", exact: true }).click();
  await expect(page).toHaveURL(`${hospital}/receptionist/appointments`);
  await expect(page.getByRole("heading", { name: "Appointments" })).toBeVisible();
});

test("check-in finds a patient by HIN, or offers to register them", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  await page.getByRole("button", { name: "Check-in patient" }).click();
  const dialog = page.getByRole("dialog", { name: "Check-in patient" });

  const hin = dialog.getByLabel("Enter HIN");
  await hin.fill("12334567890");
  await expect(hin).toHaveValue("123-345-678-90");
  await expect(dialog.getByText("Adeola Williams")).toBeVisible();
  await expect(dialog.getByText("36 yrs · Female")).toBeVisible();

  await hin.fill("999-999-999-99");
  await expect(dialog.getByText("No patients found")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Register Patient" })).toBeVisible();
});

test("a patient's profile shows their details and linked accounts", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  await page.getByRole("button", { name: "Check-in patient" }).click();
  await page.getByLabel("Enter HIN").fill("12334567890");
  await page.getByRole("link", { name: /Adeola Williams/ }).click();

  await expect(page.getByRole("heading", { name: "Adeola Williams" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
  await expect(page.getByText("Dependent Account")).toBeVisible();
  await expect(page.getByRole("tab", { name: /All Visits/ })).toContainText("12");
  // 12 visits, 7 to a page.
  await expect(page.getByText("Showing 1 to 7 of 12 entries")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Showing 8 to 12 of 12 entries")).toBeVisible();

  // A dependent's profile lists the proxies managing it instead.
  await page.getByRole("link", { name: "View Samuel Williams" }).click();
  await expect(page.getByRole("heading", { name: "Samuel Williams" })).toBeVisible();
  await expect(page.getByText("Dependent", { exact: true })).toBeVisible();
  await expect(page.getByText("Proxy Account")).toBeVisible();
  await expect(page.getByText("Mother", { exact: true }).filter({ visible: true })).toBeVisible();
});

test("checking out someone with no requests offers to book a follow-up", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  await page.getByRole("button", { name: "Check out Amina Yusuf" }).click();
  const dialog = page.getByRole("dialog", { name: "Check-out Patient" });
  await expect(dialog.getByText("No appointment requests")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Book Appointment" })).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).toBeHidden();
});

test("registering a patient verifies their email, then shows their new HIN", async ({ page }) => {
  await page.goto(`${hospital}/receptionist`);
  await page.getByRole("button", { name: "Register patient" }).click();
  let dialog = page.getByRole("dialog", { name: "Patient Information" });

  // Nothing filled in: step 1 says what's missing and stays put.
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(dialog.getByText("Enter the patient's first name")).toBeVisible();

  await dialog.getByLabel("First name").fill("Bola");
  await dialog.getByLabel("Last name").fill("Adekunle");
  await dialog.getByRole("combobox", { name: "Gender" }).click();
  await expect(page.getByRole("option")).toHaveText(["Male", "Female", "Prefer not to say"]);
  await page.getByRole("option", { name: "Prefer not to say" }).click();
  await dialog.getByLabel("Email").fill("bola.adekunle@email.com");
  await dialog.getByLabel("Phone Number").fill("+234-803-111-2233");
  await dialog.getByRole("button", { name: "Continue" }).click();

  dialog = page.getByRole("dialog", { name: "Verify account" });
  await expect(dialog.getByText("sent to bola.adekunle@email.com")).toBeVisible();
  const code = dialog.getByLabel("Verification code");
  await code.fill("000000");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(dialog.getByText("That code isn’t right")).toBeVisible();
  // 123456 is the code the mock API accepts.
  await code.clear();
  await code.fill("123456");
  await dialog.getByRole("button", { name: "Continue" }).click();

  dialog = page.getByRole("dialog", { name: "Contact & account details" });
  await dialog.getByRole("textbox", { name: "NIN" }).fill("12345678901");
  await dialog.getByRole("textbox", { name: "Password", exact: true }).fill("Welcome123!");
  await dialog.getByRole("textbox", { name: "Confirm Password" }).fill("Welcome123!");
  await dialog.getByRole("button", { name: "Register" }).click();

  const created = page.getByRole("dialog", { name: "Account Created!" });
  await expect(created.getByText(/Patient’s HIN: \d{3}-\d{3}-\d{3}-\d{2}/)).toBeVisible();
  await created.getByRole("button", { name: "Done" }).click();
  await expect(created).toBeHidden();
});

test("booking an appointment from a patient's profile", async ({ page }) => {
  await page.goto(`${hospital}/receptionist/patients/registered-1`);
  await page.getByRole("button", { name: "Book an appointment" }).click();
  const dialog = page.getByRole("dialog", { name: "Appointment Details" });
  await expect(dialog.getByText("Adeola Williams")).toBeVisible();

  await dialog.getByRole("button", { name: "Book Appointment" }).click();
  await expect(dialog.getByText("Enter a date as DD/MM/YYYY")).toBeVisible();

  // Typed: digits only, the slashes go in by themselves.
  const date = dialog.getByRole("textbox", { name: "Date" });
  await date.pressSequentially("01012020");
  await expect(date).toHaveValue("01/01/2020");
  await dialog.getByRole("button", { name: "Book Appointment" }).click();
  await expect(dialog.getByText("Pick a date from today on")).toBeVisible();

  // Picked: the 15th of next month from the calendar.
  await dialog.getByRole("button", { name: "Choose a date" }).click();
  await page.getByRole("button", { name: /next month/i }).click();
  await page.getByRole("button", { name: /15th/ }).click();
  const next = new Date();
  next.setDate(1);
  next.setMonth(next.getMonth() + 1);
  const month = String(next.getMonth() + 1).padStart(2, "0");
  await expect(date).toHaveValue(`15/${month}/${next.getFullYear()}`);

  const time = dialog.getByRole("textbox", { name: "Time" });
  await dialog.getByRole("button", { name: "Choose a time" }).click();
  await page.getByRole("button", { name: "10 hour" }).click();
  await page.getByRole("button", { name: "30 minute" }).click();
  await expect(time).toHaveValue("10:30");
  await dialog.getByLabel("Add note").fill("Review blood test results.");
  await dialog.getByRole("button", { name: "Book Appointment" }).click();

  const booked = page.getByRole("dialog", { name: "Appointment booked!" });
  await expect(booked).toBeVisible();
  await booked.getByRole("button", { name: "Done" }).click();
  await expect(booked).toBeHidden();
});
