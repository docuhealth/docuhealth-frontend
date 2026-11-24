# QA test guide: DocuHealth v2

How to test the v2 web app by hand: setup, one full patient journey across every role, then a
checklist for each dashboard. Each section ends with **Known gaps**: things that are missing
because the backend doesn't have them yet. Don't report those as bugs; they're tracked in
[`backend-gaps-v2-migration.md`](backend-gaps-v2-migration.md).

## 1. Setup

### Where to test

The deployed v2 site can't reach the staging API right now (the API's CORS allows no website;
backend handoff item 1). Until that's fixed, test on a computer with the code:

```bash
npm install
npm run dev:staging   # real staging data, at port 5180
npm run dev           # or: demo mode with fake data, at port 5173
```

| Section                    | Staging data (`dev:staging`)         | Demo data (`dev`)                    |
| -------------------------- | ------------------------------------ | ------------------------------------ |
| Public site, patient login | http://localhost:5180                | http://localhost:5173                |
| Hospital staff login       | http://hospital.localhost:5180/login | http://hospital.localhost:5173/login |
| DocuHealth admin login     | http://admin.localhost:5180/login    | http://admin.localhost:5173/login    |

Use Chrome or Edge (they open `*.localhost` without extra setup). Once CORS is fixed, the same
checks apply on `https://v2.docuhealthservices.net` and `https://hospital.v2.docuhealthservices.net`.

### Accounts

- **Staging:** ask the team lead for the staging test accounts (one per role: hospital admin,
  receptionist, doctor, nurse, lab scientist, lab admin, pharmacist, radiologist, DocuHealth
  admin). They aren't written in the repo.
- **Demo mode:** any password works. The part of the email before `@` picks the role:

  | Email                 | Logs in as                                        |
  | --------------------- | ------------------------------------------------- |
  | `reception@test.com`  | Receptionist                                      |
  | `doctor@test.com`     | Doctor                                            |
  | `nurse@test.com`      | Nurse                                             |
  | `lab@test.com`        | Lab scientist                                     |
  | `pharmacy@test.com`   | Pharmacist                                        |
  | `radiology@test.com`  | Radiologist                                       |
  | `anything@test.com`   | Hospital admin (patient on the main site's login) |
  | `firstlogin@test.com` | Hospital admin on first login (asks for details)  |
  | `dhadmin@test.com`    | DocuHealth admin (on the `admin.` login)          |
  | `wrong@test.com`      | Fails with "Invalid login credentials"            |

  On sign-up, desk registration and password reset, two more emails try the new code rules:
  `exists@test.com` already has an account (after the code you're sent to log in, or at the desk
  told to look them up by HIN), and `wait@test.com` is refused a second code, so "Resend Code"
  counts down.

  There's no demo lab admin; test the lab admin on staging. Demo forms come pre-filled; clear a
  field before typing. Demo data resets when the page reloads.

### Rules for staging

Staging data is shared with other teams. **Read-only checks are always fine.** Before anything that
changes data (check in, approve, reject, discharge, deactivate a user, buy a plan), agree on it
with the team, use test patients only, and never buy a subscription plan (it starts a real
payment). Do the write-heavy testing in demo mode.

### What to report

For each bug: the role, the URL, the steps, what you expected, what happened, and a screenshot.
If the screen shows an error message from the API (e.g. `staff: This field is required.`), copy it
exactly.

---

## 2. One patient's journey, across every role

This is the main flow to test. It only joins up **on staging**, with a test patient and the team's
OK: in demo mode each dashboard has its own sample data, so a patient checked in by the
receptionist doesn't appear in the demo nurse's queue (each step can still be tried on its own
there). Use one browser profile per role, or log out between steps.

| Step | Role             | Where                                         | Do this                                                                             | Expect                                                          |
| ---- | ---------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1    | Receptionist     | Patient Mgt.                                  | Find the patient by HIN (or register a new one), open their profile, **Check in**   | The patient appears in the reception queue                      |
| 2    | Nurse            | Nursing Encounter → Pending                   | Claim the patient, record vitals and triage, **send to doctor**                     | Moves to "Sent to doctor"                                       |
| 3    | Doctor           | Doctor Encounter → Waiting                    | **See patient**, then open their page                                               | Moves to "In consultation"                                      |
| 4    | Doctor           | Patient page                                  | Write an encounter note (two steps); order a lab test, a scan and a prescription    | Each shows a success message and appears on the patient's page  |
| 5    | Lab scientist    | Test orders                                   | Open the order, accept it, record the sample time, enter and send the result        | The order moves through the tabs; the result waits for approval |
| 6    | Lab admin        | Test orders → Awaiting Approval               | Approve the result (or return it with a reason)                                     | Approved results go to the doctor                               |
| 7    | Radiologist      | Scan orders                                   | Accept the scan, set the imaging time, upload the report                            | The order moves to completed                                    |
| 8    | Doctor           | Results                                       | Approve the lab result; reject the scan report with a reason (a reason is required) | Each leaves the list with a confirmation message                |
| 9    | Pharmacist       | Prescriptions → Pending                       | Open the prescription, tick drugs to dispense, mark one unavailable with a reason   | It moves to Settled                                             |
| 10   | Doctor           | Patient page                                  | Request admission (pick a ward, then a free bed)                                    | A pending admission request                                     |
| 11   | Receptionist     | Admissions → Pending                          | Admit the patient                                                                   | Moves to Admitted                                               |
| 12   | Nurse            | Patient Mgt. → Admitted → the patient → Notes | Write the admission note                                                            | Until it's written, the admission's tasks can't be worked       |
| 13   | Doctor           | Admitted patient → Care tasks                 | Add a care task (e.g. vital signs every 4 hours)                                    | The task appears for the nurses                                 |
| 14   | Nurse            | Tasks                                         | Claim the task and record it                                                        | It moves out of Pending                                         |
| 15   | Doctor and nurse | Patient page → Hand over                      | Hand the patient over to a colleague with a note                                    | It shows under Handover notes for both                          |
| 16   | Doctor           | Admitted patient → Discharge                  | Fill both steps (summary; condition, instructions, take-home drugs, follow-up)      | The nurses get a discharge checklist task                       |
| 17   | Nurse            | The patient's page                            | Record the discharge checklist (final vitals, checks, condition, education)         | The patient shows as discharged                                 |

---

## 3. Checklists by role

Every staff dashboard also has the shared pages: **Appointments** (Today / Upcoming / Past, search,
date range), **Health personnel** (search, role filter, pages), **Settings** (name, phone, email
with a code, password) and the top bar (name, greeting, log out). Check them once per role.

### Login and access (all roles)

- [ ] Each role lands on its own dashboard after login (receptionist → `/receptionist`, doctor →
      `/doctor`, and so on; radiographers share the radiologist's).
- [ ] Typing another role's URL (e.g. a nurse opening `/admin`) sends you back to your own
      dashboard.
- [ ] A staff role with no dashboard sees "your dashboard isn't ready yet" with Log out.
- [ ] Wrong password shows an error; Forgot password sends a code and lets you set a new password.
      Patients can reset with their email or phone number; staff with their email only.
- [ ] Every code screen says where the code went (masked, e.g. `a***@example.com`), and "Resend
      Code" counts down if you ask again too soon.
- [ ] Log out returns to the login page; the back button doesn't reopen the dashboard.
- [ ] On staging, a tab left open for a long time (e.g. over lunch) still works when you click
      around (the session refreshes), or shows "You're signed out" with a way back to log in.

### Hospital admin

- [ ] Dashboard: team size, staff by role, today's queue.
- [ ] Staff Mgt.: search, On team / Removed, open a staff profile, remove and **Undo**, add staff
      (no password: the new member is emailed a temporary one, with a link to the hospital login).
- [ ] Add Facility: type, the facility's name and address, and its admin.
- [ ] Patient Mgt.: the four tabs with counts, search, open a patient profile.
- [ ] Ward Mgt.: create a ward, rename or resize, delete, see beds.
- [ ] Audit logs: list, lab and radiology downloads.
- [ ] Wallet: subscription plans listed (don't buy one on staging).
- [ ] Settings: change the banner photo.
- **Known gaps:** admin access toggle, joining dates, facility count, check-in stats, patient
  filters and sorting, staff activity, patient visit history, wallet balance ("Not available
  yet").

### Receptionist

- [ ] Dashboard: queue and today's appointments; check a patient out.
- [ ] Patient Mgt.: HIN lookup, profile, **Check in**, register a patient (with date of birth),
      add a dependant.
- [ ] Appointments: three tabs, search, calendar, open an appointment, book one.
- [ ] Admissions: Pending / Admitted / Rejected, search, admit, reject with a reason.
- **Known gaps:** most overview figures, reschedule and cancel, follow-up requests, linking an
  existing child. **Booking** fails with `staff: This field is required.` until the backend
  changes it.

### Doctor

- [ ] Overview: waiting patients, appointments, referrals, admissions, monthly chart.
- [ ] Doctor Encounter: Waiting / In consultation / Seen; see a patient, end, resume, check out.
- [ ] Patient page: details, latest vitals, drugs, visit records, encounter notes, lab results.
- [ ] Orders: lab test (a repeat order shows a warning you can confirm), scan, prescription,
      admission and transfer, referral to another hospital.
- [ ] Request vitals from a nurse.
- [ ] Notes tab on an admission: progress, admission and case notes; write a progress note.
- [ ] Results: lab results and scan reports; approve, or reject with a reason.
- [ ] Discharge (see the journey, step 16).
- **Known gaps:** charts, care plans and vitals history aren't readable by doctors (the API
  refuses); lab results on the Results page show "Patient —"; patients can't be found by HIN in
  the lists.

### Nurse

- [ ] Overview: vitals requests to take, admitted patients without an admission note.
- [ ] Nursing Encounter: Pending / Sent to doctor / Closed; claim, assess, send to doctor or close,
      reopen.
- [ ] Tasks: claim, record each task type, confirm a medication, release, escalate, mark missed.
- [ ] Admission's Notes tab: admission note, case notes, care plans, vitals, progress notes.
- [ ] Charts and today's fluid balance.
- [ ] Appointments: assign an appointment to a doctor.
- [ ] Discharge checklist (journey, step 17).
- **Known gaps:** "Doctors' notes" says they aren't available (the API returns an error);
  the discharge checklist is recorded from the patient's page, not from Tasks.

### Lab scientist and lab admin

- [ ] Overview counts.
- [ ] Test orders: four tabs; open an order; accept or reject; sample time; send results per test.
- [ ] Book an appointment.
- [ ] Lab admin only: Awaiting Approval, approve or return results, Audit logs in the sidebar.
- [ ] A finished order (results ready or approved): **Print** opens the print dialog with the
      official report; **Download** saves an A4 PDF named `patient_test_hospital.pdf`. The report
      shows the hospital, the patient (masked HIN, age, sex), each test's values, units, ranges and
      flags, and the interpretation.
- [ ] Unfinished orders (pending, in progress, sample collected, rejected) have no Print or
      Download; an order whose results aren't in yet shows them greyed out with the reason.
- [ ] Each print or download appears in the lab admin's **Audit logs** (on staging).
- **Known gaps:** approved and returning-patient figures, date filters, patient lookup by HIN.
  The report shows the hospital's initials, not its logo, and not who uploaded the result (the
  API doesn't send either).

### Radiologist

- [ ] Overview counts.
- [ ] Scan orders: four tabs; open an order; accept or reject; imaging time; upload the report.
- [ ] Schedule and book an appointment.
- [ ] A completed scan with a report: **Print** and **Download** (A4 PDF) of the official report:
      findings, impression, recommendations, who reported it, and the attached files' names. Each
      attached file can also be downloaded on its own.
- [ ] No Print or Download before the report is in, or when the doctor sent the report back.
- [ ] Each print or download appears in the hospital admin's **Audit logs** → radiology (on
      staging).
- **Known gaps:** date filters and sorting, the "New" badge, booking only finds patients who
  already have a radiology order. The report shows the hospital's initials, not its logo.

### Pharmacist

- [ ] Overview: pending and settled prescriptions, drugs dispensed, chart (daily to yearly),
      recent patients.
- [ ] Prescriptions: Pending / Settled, sort Latest or Oldest; open one; dispense or mark
      unavailable.
- **Known gaps:** no walk-in drug order (not built: the API needs a visit for every order).

### DocuHealth admin (`admin.` login)

- [ ] Overview: totals, charts by day / month / year, users by state.
- [ ] Users: individuals and hospitals, search, deactivate and activate (demo mode only).
- [ ] Facility applications: by status, documents, approve, reject with a reason (demo mode only).
- [ ] Register a facility: the three steps (details, location, admin) for a facility registered in
      person (demo mode only). The old `agent.` address now opens this page.
- [ ] Subscription plans: add, edit.
- [ ] Settings: change password.
- **Known gaps:** the top bar shows the email used to log in (the API sends no name); "reviewed
  by" is empty on applications.

### Public site

- [ ] Home page, navbar and footer links, and the mobile menu (it jumps to the section you tap).
- [ ] Mission, Vision, News, DocuHealth API, Privacy, Terms (patient and hospital tabs), API terms,
      Legal notice.
- [ ] Patient sign-up and login; hospital registration (`hospital.` → Register).
- [ ] Sign-up's Terms and Privacy links open the right pages.
- **Known gaps:** the contact form and newsletter have no endpoint; the newsletter says sign-up
  isn't available yet.

---

## 4. Also check

- [ ] Phone width (about 375 px): menus, tables and dialogs fit without sideways scrolling.
- [ ] Slow network (DevTools → Network → Slow 4G): while data loads, tables show grey
      placeholder rows in their columns' shape, cards and lists show placeholder blocks, and a page
      that takes a moment shows a placeholder page. No "Loading…" text, and nothing flashes the
      wrong list.
- [ ] Empty states: a table, list or chart with nothing in it shows the same picture (an open
      tray with a magnifier) and says why it's empty, e.g. search staff for "zzzz".

### Saved drafts

Unsent input comes back after a refresh, so try each form: type, refresh (or close the tab and
reopen it), open the form again.

- [ ] Registration and admin forms (receptionist's Register patient, Add Staff, Add Facility):
      the details come back with "We restored what you’d typed before." and **Discard**. Also
      after closing the browser, for up to 24 hours.
- [ ] Clinical notes (doctor's encounter note; nurse's admission note; progress notes, case notes
      and care plans): they come back after a refresh, but **not** after closing the tab.
- [ ] Never restored: NIN, passwords, verification codes.
- [ ] **Discard** empties those fields; sending the form clears the draft, so opening it again
      starts blank.
- [ ] Log out, log in as someone else on the same computer: none of the first person's drafts
      appear. A session that expires keeps the draft until the same person signs back in.
- [ ] One patient's note draft never shows on another patient's note.
- [ ] Errors: turn the network off, click an action: a clear message, no blank screen.
