import { expect, test } from "@playwright/test";

// The hospital section lives on its own subdomain (src/lib/sections.ts); data comes from the
// mock API (src/mocks/hospital-admin.ts).
const hospital = "http://hospital.localhost:4173";

test("dashboard shows the hospital's overview, queue and staff", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  await expect(page).toHaveTitle("Dashboard · DocuHealth");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dr. Adeyemi");
  await expect(page.getByText("Lagos University Teaching Hospital")).toBeVisible();

  const overview = page.getByRole("region", { name: "Overview" });
  await expect(overview.getByText("48", { exact: true })).toBeVisible();
  await expect(overview.getByText("+3 more")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Nurses" })).toBeVisible();
  await expect(page.getByText("20 people")).toBeVisible();
});

test("queue and staff searches filter their tables", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  await expect(page.getByText("Chinonso Okafor")).toBeVisible();

  await page.getByLabel("Search patients").fill("amina");
  await expect(page.getByText("Chinonso Okafor")).toBeHidden();
  await expect(page.getByText("Amina Yusuf")).toBeVisible();
  await page.getByLabel("Search patients").fill("nobody");
  await expect(page.getByText("No patients match “nobody”.")).toBeVisible();

  await page.getByLabel("Search staff").fill("ngozi");
  await expect(page.getByText("1 person", { exact: true })).toBeVisible();
  await expect(
    page.getByText("ngozi.eze@luth.example.com").filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByText("Showing 1 to 1 of 1 entries")).toBeVisible();
});

// Both of the staff card's layouts are in the page (CSS shows the one that fits), so text that
// appears in both is matched with `filter({ visible: true })`.

test("staff table pages through the list", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  const pagination = page.getByRole("navigation", { name: "Pagination" });
  await expect(pagination.getByText("Showing 1 to 10 of 20 entries")).toBeVisible();
  await expect(pagination.getByRole("button", { name: "Previous page" })).toBeDisabled();
  await expect(page.getByText("Esther Ibe").filter({ visible: true })).toBeVisible();

  await pagination.getByRole("button", { name: "Next page" }).click();
  await expect(pagination.getByText("Showing 11 to 20 of 20 entries")).toBeVisible();
  await expect(pagination.getByRole("button", { name: "Page 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText("Esther Ibe")).toHaveCount(0);
  await expect(pagination.getByRole("button", { name: "Next page" })).toBeDisabled();

  // A new search starts again from page 1.
  await page.getByLabel("Search staff").fill("a");
  await expect(pagination.getByRole("button", { name: "Page 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("the period picker is kept in the URL", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  await page.getByRole("combobox", { name: "Period" }).click();
  await page.getByRole("option", { name: "This Month" }).click();
  await expect(page).toHaveURL(`${hospital}/admin?period=month`);
  await expect(page.getByRole("combobox", { name: "Period" })).toContainText("This Month");
});

test("sidebar navigates between sections and logs out", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  await expect(page.getByRole("link", { name: "Messages 3 unread" })).toBeVisible();

  await page.getByRole("link", { name: "Staff Mgt." }).click();
  await expect(page).toHaveURL(`${hospital}/admin/staff`);
  await expect(page.getByRole("heading", { name: "Staff Management" })).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByText("Chinonso Okafor")).toBeVisible();

  await page.getByRole("button", { name: "Log-out" }).click();
  await expect(page).toHaveURL(`${hospital}/login`);
});

test("staff actions change who's an admin and who's on the team", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  const row = page.getByRole("row", { name: /Chioma Nwosu/ });

  // Not an admin, on the team: can be made admin or removed.
  await page.getByRole("button", { name: "Actions for Chioma Nwosu" }).click();
  await expect(page.getByRole("menuitem")).toHaveText([
    "View Profile",
    "Make Admin",
    "Remove from team",
  ]);
  await page.getByRole("menuitem", { name: "Remove from team" }).click();

  // Removing asks first, and the confirmation offers an Undo.
  const confirm = page.getByRole("dialog", { name: "Remove from team" });
  await expect(confirm).toContainText(
    "Are you sure you want to remove Chioma Nwosu from your team?",
  );
  await confirm.getByRole("button", { name: "Remove" }).click();
  const removed = page.getByRole("dialog", { name: "Member removed!" });
  await expect(removed).toContainText("Chioma Nwosu has been removed from your team");
  await removed.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Chioma Nwosu is back on the team.")).toBeVisible();
  await expect(row.getByText("On team")).toBeVisible();

  await page.getByRole("button", { name: "Actions for Chioma Nwosu" }).click();
  await page.getByRole("menuitem", { name: "Remove from team" }).click();
  await page
    .getByRole("dialog", { name: "Remove from team" })
    .getByRole("button", { name: "Remove" })
    .click();
  await page
    .getByRole("dialog", { name: "Member removed!" })
    .getByRole("button", { name: "Done" })
    .click();
  await expect(row.getByText("Removed")).toBeVisible();

  // Removed: can be added back.
  await page.getByRole("button", { name: "Actions for Chioma Nwosu" }).click();
  await page.getByRole("menuitem", { name: "Add back to team" }).click();
  const restore = page.getByRole("dialog", { name: "Add back to team" });
  await expect(restore).toContainText(
    "Are you sure you want to add Chioma Nwosu back to your team?",
  );
  await restore.getByRole("button", { name: "Add back to team" }).click();
  const added = page.getByRole("dialog", { name: "Member added!" });
  await expect(added).toContainText("Chioma Nwosu has been added back to the team");
  await added.getByRole("button", { name: "Done" }).click();
  await expect(row.getByText("On team")).toBeVisible();

  // Made admin: the only change left is removing admin access.
  await page.getByRole("button", { name: "Actions for Chioma Nwosu" }).click();
  await page.getByRole("menuitem", { name: "Make Admin" }).click();
  const grant = page.getByRole("dialog", { name: "Make admin" });
  await expect(grant).toContainText("Are you sure you want to make Chioma Nwosu an admin?");
  await grant.getByRole("button", { name: "Grant admin access" }).click();
  const granted = page.getByRole("dialog", { name: "Admin access granted!" });
  await expect(granted).toContainText("Chioma Nwosu is now an admin");
  await granted.getByRole("button", { name: "Done" }).click();
  await expect(row.getByText("Admin", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Actions for Chioma Nwosu" }).click();
  await expect(page.getByRole("menuitem")).toHaveText(["View Profile", "Remove admin access"]);

  // Removing admin access asks first, and can be undone.
  await page.getByRole("menuitem", { name: "Remove admin access" }).click();
  const revoke = page.getByRole("dialog", { name: "Remove admin access" });
  await expect(revoke).toContainText(
    "Chioma Nwosu will keep their account and their role as Nurse",
  );
  await revoke.getByRole("button", { name: "Remove" }).click();
  const revoked = page.getByRole("dialog", { name: "Access removed!" });
  await expect(revoked).toContainText("Chioma Nwosu’s admin access has been removed.");
  await revoked.getByRole("button", { name: "Done" }).click();
  await expect(row.getByText("Admin", { exact: true })).toBeHidden();
});

test("the banner photo can be changed and deleted", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  const photo = page.getByRole("region", { name: "Overview" }).locator("img");
  await expect(photo).toHaveAttribute("src", /dashboard-banner/);

  // Only an uploaded photo can be deleted.
  await page.getByRole("button", { name: "Banner photo options" }).click();
  await expect(page.getByRole("menuitem", { name: "Delete Photo" })).toHaveAttribute(
    "data-disabled",
  );
  await page.keyboard.press("Escape");

  const input = page.getByLabel("Banner photo", { exact: true });
  await input.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("x"),
  });
  await expect(page.getByText("Use a JPG, PNG or WebP photo.")).toBeVisible();

  await input.setInputFiles({
    name: "ward.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(page.getByText("Banner photo updated.")).toBeVisible();
  await expect(photo).toHaveAttribute("src", /^blob:/);

  await page.getByRole("button", { name: "Banner photo options" }).click();
  await page.getByRole("menuitem", { name: "Delete Photo" }).click();
  await expect(page.getByText("Banner photo deleted.")).toBeVisible();
  await expect(photo).toHaveAttribute("src", /dashboard-banner/);
});

test("on a phone, staff show as a list with every detail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${hospital}/admin`);

  const esther = page.getByRole("list", { name: "Staff" }).getByRole("listitem").first();
  await expect(esther).toContainText("Esther Ibe");
  await expect(esther).toContainText("esther.ibe@luth.example.com");
  for (const detail of ["On team", "Doctor", "09060406069", "3 days ago", "Female"]) {
    await expect(esther.getByText(detail)).toBeVisible();
  }
  await expect(page.getByRole("table").filter({ hasText: "Phone no." })).toBeHidden();

  await esther.getByRole("button", { name: "Actions for Esther Ibe" }).click();
  await expect(page.getByRole("menuitem", { name: "Remove admin access" })).toBeVisible();
});

test("Add Facility validates, adds the facility and invites its admin", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  const facilities = page.getByRole("region", { name: "Overview" }).getByText("Total Facilities");
  await expect(facilities.locator("xpath=../..")).toContainText("3");

  await page.getByRole("button", { name: "Add Facility" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Facilities" });
  await dialog.getByRole("button", { name: "Add Facility" }).click();
  for (const error of [
    "Select a facility",
    "Enter the admin's first name",
    "Enter the admin's last name",
    "Enter a valid phone number",
    "Enter a valid email address",
  ]) {
    await expect(dialog.getByText(error)).toBeVisible();
  }

  await dialog.getByRole("combobox", { name: "Facility" }).click();
  await page.getByRole("option", { name: "Pharmacy" }).click();
  await dialog.getByLabel("Admin first name").fill("Joe");
  await dialog.getByLabel("Admin last name").fill("Doe");
  await dialog.getByLabel("Admin phone number").fill("080-123-456-78");
  await dialog.getByLabel("Admin email address").fill("joe@luth.example.com");
  await dialog.getByRole("button", { name: "Add Facility" }).click();

  await expect(dialog).toBeHidden();
  const added = page.getByRole("dialog", { name: "Facility Added!" });
  await expect(added).toContainText(
    "Pharmacy is set up, and Joe Doe is its admin. They can now add and manage staff.",
  );
  await added.getByRole("button", { name: "Done" }).click();
  await expect(added).toBeHidden();
  await expect(facilities.locator("xpath=../..")).toContainText("4");

  // Opening it again starts from a blank form; Cancel closes it.
  await page.getByRole("button", { name: "Add Facility" }).click();
  await expect(dialog.getByLabel("Admin first name")).toHaveValue("");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});

test("Add Staff takes two steps and welcomes the new member", async ({ page }) => {
  await page.goto(`${hospital}/admin`);
  await expect(page.getByText("20 people")).toBeVisible();
  await page.getByRole("button", { name: "Add Staff" }).click();
  const dialog = page.getByRole("dialog", { name: "Add a new team member" });

  // Step 1 is checked before moving on.
  await expect(dialog.getByText("Step 1 of 2")).toBeAttached();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(dialog.getByText("Enter their first name")).toBeVisible();
  await expect(dialog.getByText("Select a role")).toBeVisible();

  await dialog.getByLabel("First name").fill("Joe");
  await expect(dialog.getByText("Make Joe an admin")).toBeVisible();
  await dialog.getByLabel("Last name").fill("Dave");
  await dialog.getByLabel("Phone number").fill("080-123-456-78");
  await dialog.getByRole("combobox", { name: "Role" }).click();
  await page.getByRole("option", { name: "Pharmacist" }).click();
  await dialog.getByRole("checkbox", { name: "Make Joe an admin" }).check();
  await dialog.getByRole("button", { name: "Continue" }).click();

  // Step 2: the welcome message fills itself in from the details.
  await expect(dialog.getByText("Step 2 of 2")).toBeAttached();
  await dialog.getByLabel("Email address").fill("joe.dave@luth.example.com");
  await dialog.getByLabel("Password").fill("Welcome123!");
  const message = dialog.getByRole("textbox", { name: "Message" });
  await expect(message).toContainText("Hi Joe,");
  await expect(message).toContainText("Email: joe.dave@luth.example.com");
  await expect(message).toContainText("Password: Welcome123!");
  await expect(message).toContainText("Dr. Folake Adeyemi");

  await dialog.getByRole("button", { name: "Add Staff" }).click();
  const added = page.getByRole("dialog", { name: "Staff Added!" });
  await expect(added).toContainText("They’ll receive an email to get started.");
  await added.getByRole("button", { name: "Done" }).click();

  await expect(page.getByText("21 people")).toBeVisible();
  const row = page.getByRole("row", { name: /Joe Dave/ });
  await expect(row).toContainText("Pharmacist");
  await row.getByRole("button", { name: "Actions for Joe Dave" }).click();
  await expect(page.getByRole("menuitem", { name: "Remove admin access" })).toBeVisible();
});

test("Staff Management filters, badges admins and removes selected staff", async ({ page }) => {
  await page.goto(`${hospital}/admin/staff`);
  await expect(page).toHaveTitle("Staff Management · DocuHealth");
  await expect(page.getByText("20 staff · 4 admins")).toBeVisible();
  const esther = page.getByRole("row", { name: /Esther Ibe/ });
  await expect(esther.getByText("Admin", { exact: true })).toBeVisible();

  // The filter narrows the list; "Admins" shows only the four admins.
  await page.getByRole("combobox", { name: "Show" }).click();
  await page.getByRole("option", { name: "Admins" }).click();
  await expect(page.getByText("Showing 1 to 4 of 4 entries")).toBeVisible();
  await page.getByRole("combobox", { name: "Show" }).click();
  await page.getByRole("option", { name: "All Staff" }).click();

  // Ticking turns the summary into "n selected · Remove selected".
  await expect(page.getByRole("button", { name: "Remove selected from the team" })).toBeDisabled();
  await page.getByRole("checkbox", { name: "Select Chioma Nwosu" }).check();
  await page.getByRole("checkbox", { name: "Select Emeka Uche" }).check();
  await page.getByRole("checkbox", { name: "Select Kemi Adewale" }).check();
  await page.getByRole("checkbox", { name: "Select Esther Ibe" }).check();
  await expect(page.getByText("4 selected")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Select all on this page" })).toHaveAttribute(
    "data-state",
    "indeterminate",
  );

  // The confirmation leaves out the admin; ✕ keeps someone.
  await page.getByRole("button", { name: "Remove selected" }).click();
  await expect(page.getByText("Admins and staff already removed aren’t included.")).toBeVisible();
  const confirm = page.getByRole("dialog", { name: "Remove 3 staff?" });
  await expect(confirm.getByRole("listitem")).toHaveCount(3);
  await confirm.getByRole("button", { name: "Keep Kemi Adewale" }).click();
  await expect(page.getByRole("dialog", { name: "Remove 2 staff?" })).toBeVisible();
  await page.getByRole("button", { name: "Remove 2 staff" }).click();

  // Removed, with Undo; Done keeps the change.
  const removed = page.getByRole("dialog", { name: "2 staff removed!" });
  await removed.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("2 staff back on the team.")).toBeVisible();
  await expect(page.getByRole("row", { name: /Chioma Nwosu/ })).toContainText("On team");

  await page.getByRole("checkbox", { name: "Select Chioma Nwosu" }).check();
  await page.getByRole("checkbox", { name: "Select Emeka Uche" }).check();
  await page.getByRole("button", { name: "Remove selected" }).click();
  await page.getByRole("button", { name: "Remove 2 staff" }).click();
  await page
    .getByRole("dialog", { name: "2 staff removed!" })
    .getByRole("button", { name: "Done" })
    .click();
  await expect(page.getByRole("row", { name: /Chioma Nwosu/ })).toContainText("Removed");
  await expect(page.getByRole("row", { name: /Emeka Uche/ })).toContainText("Removed");
  await expect(esther).toContainText("On team");
  await expect(page.getByRole("checkbox", { name: "Select Chioma Nwosu" })).not.toBeChecked();

  // Keeping everyone ends on "Everyone is staying"; Undo brings the list back.
  await page.getByRole("checkbox", { name: "Select Kemi Adewale" }).check();
  await page.getByRole("button", { name: "Remove selected" }).click();
  await page.getByRole("button", { name: "Keep Kemi Adewale" }).click();
  const staying = page.getByRole("dialog", { name: "Everyone is staying" });
  await expect(staying).toContainText("You’ve kept 1 person, so no one will be removed.");
  await staying.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("dialog", { name: "Remove 1 staff?" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  // Select all ticks the whole page; a new page starts with nothing ticked.
  await page.getByRole("checkbox", { name: "Select all on this page" }).check();
  await expect(page.getByText("10 selected")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("selected", { exact: false })).toHaveCount(0);

  await expect(page.getByRole("button", { name: "Refresh" })).toBeEnabled();
});

test("a staff profile shows their details, activity and access", async ({ page }) => {
  await page.goto(`${hospital}/admin/staff`);
  await page.getByRole("button", { name: "Actions for Emeka Uche" }).click();
  await page.getByRole("menuitem", { name: "View Profile" }).click();

  await expect(page).toHaveURL(`${hospital}/admin/staff/staff-3?period=month`);
  await expect(page).toHaveTitle("Emeka Uche · DocuHealth");
  await expect(page.getByRole("heading", { level: 1, name: "Emeka Uche" })).toBeVisible();
  await expect(page.getByText("Staff ID: STF-00203")).toBeVisible();
  await expect(page.getByText("Active", { exact: true })).toBeVisible();
  await expect(page.getByText("Total patients seen")).toBeVisible();
  await expect(page.getByText("What Emeka can do in DocuHealth as a lab scientist")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Lab tests: allowed" })).toBeChecked();
  await expect(page.getByRole("switch", { name: "Prescriptions: not allowed" })).not.toBeChecked();

  // The period is kept in the URL and relabels the numbers.
  await page.getByRole("combobox", { name: "Period" }).click();
  await page.getByRole("option", { name: "This Week" }).click();
  await expect(page).toHaveURL(`${hospital}/admin/staff/staff-3?period=week`);
  await expect(page.getByText("Appointments this week")).toBeVisible();

  // Removing from here uses the same confirmations, and the header follows.
  await page.getByRole("button", { name: "Remove from team" }).click();
  await page
    .getByRole("dialog", { name: "Remove from team" })
    .getByRole("button", { name: "Remove" })
    .click();
  await page
    .getByRole("dialog", { name: "Member removed!" })
    .getByRole("button", { name: "Done" })
    .click();
  await expect(page.getByText("Removed", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add back to team" })).toBeVisible();

  await page.getByRole("link", { name: "Back to Staff Mgt." }).click();
  await expect(page).toHaveURL(`${hospital}/admin/staff`);
});

test("an unknown staff profile says so", async ({ page }) => {
  await page.goto(`${hospital}/admin/staff/nobody`);
  await expect(
    page.getByRole("heading", { name: "We couldn’t find this staff member" }),
  ).toBeVisible();
});

test("patient management switches tabs, filters and pages", async ({ page }) => {
  await page.goto(`${hospital}/admin/patients`);
  await expect(page).toHaveTitle("Patient Management · DocuHealth");
  await expect(page.getByText("2,418")).toBeVisible();

  const pagination = page.getByRole("navigation", { name: "Pagination" });
  await expect(pagination.getByText("Showing 1 to 6 of 24 entries")).toBeVisible();
  await expect(page.getByText("Yemi Ojo").filter({ visible: true })).toBeVisible();

  await page.getByRole("tab", { name: /Discharged Patients/ }).click();
  await expect(page).toHaveURL(/tab=discharged/);
  await expect(page.getByRole("combobox", { name: "Discharged date" })).toContainText(
    "Discharged: Anytime",
  );
  await expect(pagination.getByText("Showing 1 to 4 of 4 entries")).toBeVisible();

  await page.getByRole("combobox", { name: "Ward" }).click();
  await page.getByRole("option", { name: "ICU ward" }).click();
  await expect(pagination.getByText("Showing 1 to 1 of 1 entries")).toBeVisible();
  await expect(page.getByText("Precious Obi").filter({ visible: true })).toBeVisible();

  await page.getByLabel("Search patients").fill("nobody");
  await expect(
    page.getByText("No patients match your search.").filter({ visible: true }),
  ).toBeVisible();
});

test("a patient profile shows their details and filters their visits", async ({ page }) => {
  await page.goto(`${hospital}/admin/patients`);
  await page.getByRole("link", { name: "View Yemi Ojo" }).filter({ visible: true }).click();
  await expect(page).toHaveURL(`${hospital}/admin/patients/patient-1`);
  await expect(page).toHaveTitle("Yemi Ojo · DocuHealth");
  await expect(page.getByText("yemi.ojo@email.com")).toBeVisible();

  const history = page.getByRole("list", { name: "Visits" });
  await expect(history.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("tab", { name: /Appointment/ }).click();
  await expect(history.getByRole("listitem")).toHaveCount(1);

  await page.getByRole("link", { name: "Back to Patient Mgt." }).click();
  await expect(page.getByRole("heading", { name: "Patient Management" })).toBeVisible();
});

test("a patient who has never visited sees the empty states", async ({ page }) => {
  await page.goto(`${hospital}/admin/patients/patient-25`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Adebayo Johnson");
  await expect(page.getByText("N/A")).toHaveCount(3);
  await expect(page.getByText("No visits yet")).toBeVisible();
});

test("an unknown patient shows a way back", async ({ page }) => {
  await page.goto(`${hospital}/admin/patients/nobody`);
  await expect(page.getByRole("heading", { name: "We couldn’t find this patient" })).toBeVisible();
});
