# v2 migration plan

Bringing the dashboards that v2 doesn't have yet (and the real backend) over from v1, on v2's own
structure and components. v1 (`DocuHealth-` repo) is the guide to **what** each dashboard does;
the staging OpenAPI schema (`docs/api/`, `npm run api:schema`) is the source of truth for
**endpoints and shapes**. Backend problems found on the way go in
[`backend-gaps-v2-migration.md`](backend-gaps-v2-migration.md).

**Decision (21 Nov):** keep the designs; connect what the API supports and leave the rest marked
`TODO(api)` until the backend adds it.

**Per dashboard:** list its endpoints → shell (routes, sidebar, top bar) → pages from v2 parts
(v2's look where there's no design yet) → tests and a click-through on staging (`npm run dev:staging`).

**Not included:** the patient dashboard (new design coming), the partner dashboard (retired), and
v1's dead code (Pharmacy Mode, the pharmacy request table, the old Guest/Emergency lookup, the
Newsletter form, the mocked outpatient list).

## Phase 0: Setup

- [x] Staging test accounts for every role (kept outside the repo)
- [x] v2 runs against staging with mocks off: `npm run dev:staging` (port 5180; the dev server
      proxies `/api`, so staging's CORS doesn't block `hospital.localhost`)
- [x] Staging's OpenAPI schema saved to `docs/api/` (`npm run api:schema`)
- [x] Backend gaps file started
- [x] Login routing: an arm's admin (e.g. the lab admin) lands on the arm's dashboard, not the
      hospital admin's
- [x] Pharmacists land on the pharmacy dashboard (phase 3)
- [x] Doctors and nurses land on their own dashboards (phase 4.1)

## Phase 1: Shared staff pages

Built as `src/features/staff/` (routes compose it into each dashboard).

- [x] Settings: change name and phone, email (with code), password
- [x] Health Personnel: staff directory with search, role filter and pagination
- [x] Appointments: Today / Upcoming / Past, search, date range, close appointment
- [x] Used in Admin, Receptionist (settings, personnel), Radiologist and Lab Scientist
- [x] Checked on staging data (radiologist: settings, 3 colleagues, 16 past appointments)
- [x] Staging hospital admin account's first login done (as "Test Admin", doctor)

## Phase 2: Connect the redesigned dashboards to the real backend

- [x] Every dashboard's profile (top bar, greeting, banner) from `GET /api/auth/staff/profile`

- [x] Receptionist: overview (queue and today's appointments), appointments (3 tabs, search),
      calendar, appointment page, queue with check-out, HIN lookup, patient profile, desk
      registration and dependants on the real API. Checked on staging (reads). Blocked by the API:
      registration needs a date of birth and booking needs a staff member, which the design doesn't
      ask for (shows the API's error). Not available yet: reschedule, cancel, follow-up requests,
      linking an existing child, most overview figures (gaps file, section 7)
- [x] Receptionist admission requests (no design; built from v1 with v2's parts): pending,
      admitted and rejected tabs, search; admit, or reject with a reason. Checked on staging
      (reads: 47 admitted, 48 rejected)
- [x] Radiologist: overview counts, scan records (4 tabs), order page, schedule, uploads, booking;
      accept, reject, imaging time and report upload on `api/radiology/*`. Checked on staging (reads
      only, to leave shared staging data alone). Waiting on the backend: date filters, single-order
      endpoint, HIN lookup, "New"/"Appt" fields (gaps file, section 7)
- [x] Lab Scientist: overview, test records (4 tabs), order page with results, appointments,
      awaiting approval, booking; accept, reject, sample time and results sent per test on
      `api/lab/*`. Checked on staging (reads). Waiting on the backend: item-level list filter,
      approved/returning figures, HIN lookup for lab staff, dates (gaps file, section 7)
- [x] Lab admin result review (no design): Approve / Return results on the order page for the
      lab's admin, "Awaiting Approval" rows open their order, audit logs in the lab admin's
      sidebar. Checked on staging (reads; nothing approved)
- [x] Hospital Admin: overview (team size, staff by role, queue), staff management (search,
      on team / removed, remove and undo, add staff), staff profile, patient management (4 tabs,
      search, counts), patient profile, banner photo on the real API. Checked on staging (reads).
      Not available yet: admin access, joining dates, facility count, check-in stats, patient
      filters and sorting, staff activity and permissions, patient visit history. Blocked by the
      API: adding a facility needs a name and address the design doesn't ask for (gaps file,
      section 7)
- [x] Hospital Admin (no designs): ward management (create, rename/resize, delete, beds),
      audit logs (lab and radiology downloads), wallet (subscription plans and choosing one;
      balance not available yet: no wallet API). Checked on staging (reads; no plan bought)

## Phase 3: Pharmacy

- [x] Shell and login routing (`pharmacist` → `/hospital/pharmacy`)
- [x] Overview: pending / settled prescriptions, drugs dispensed, recent patients; dispensed-drugs
      chart (daily, weekly, monthly, yearly); recent patients table (24 hours to 3 months)
- [x] Prescriptions: pending / settled, sort by latest or oldest
- [x] Prescription page: drugs (tick to dispense or mark unavailable, with an optional reason),
      who prescribed it, allergies, latest vitals
- [ ] Walk-in drug order: not built. The API now needs a check-in or admission for every drug
      order, and a walk-in has neither (gaps file, section 7, Pharmacy)
- [x] Appointments, Health Personnel, Settings (shared staff pages)
- [x] Checked on staging as the pharmacist (reads: 65 pending, 8 settled, 6 drugs dispensed;
      nothing dispensed)

## Phase 4: Doctor and Nurse

Built in seven steps, one commit each; what v1 does and the endpoints behind it are in
`docs/phase-4-doctor-nurse.md`.

- [x] 4.1 Shared base: doctor and nurse shells and login routing, patient lists (admitted,
      checked in, checked out, discharged), patient page (details, latest vitals, ongoing drugs,
      visit records incl. discharge forms). Checked on staging as the doctor (reads). Pickers come
      with the steps that use them
- [x] 4.2 Nurse front line: nursing encounter queue (pending / sent to doctor / closed; claim,
      assess with vitals and triage, send to doctor or close, reopen), overview (doctors' vitals
      requests to take, admitted patients flagged without an admission note), one vitals form for
      every clinical screen. Checked on staging as the nurse (reads: 36 requests, 15 admitted, 87
      sent to doctor; nothing claimed or recorded)
- [x] 4.3 Doctor front line: Doctor Encounter queue (waiting / in consultation / seen; see a
      patient, end, resume, check out), the doctor's patient page tabs (encounter notes with added
      notes, lab results) and consultation actions (new encounter note in two steps, request vitals
      from a nurse, end consultation). Checked on staging as the doctor (reads; the queue was
      empty). Not yet in the note: investigation files, referral, next appointment
- [x] 4.4 Doctor orders: lab tests (category or search, repeat-order warning), scans (catalogue
      search), prescriptions (catalogue drug or typed, dose, route, frequency, duration,
      allergies), admission request and transfer (ward, then a free bed), referral (another
      DocuHealth hospital, with a reason). From a consultation that's the doctor's, or an active
      admission. Checked on staging as the doctor (reads: 79 lab tests, scans, drugs, hospitals,
      wards; nothing ordered)
- [x] 4.5 Inpatient care: the doctor sets care tasks on an admission (vital signs, medication,
      fluids, procedure, glucose, IV fluid, seizure watch; start, frequency, until discharge or
      for a set time, priority) and sees them under Care tasks; the nurse's task queue on the
      admission and on a Tasks page for every patient (claim, record each type's details, confirm
      a medication, release, escalate, mark missed); charts and today's fluid balance. The
      discharge checklist task comes in 4.7. Checked on staging (reads: the doctor's task
      history; the nurse's list against staging's own rows in a test)
- [x] Fixed: an expired access token now refreshes for the staff profile too (it's under
      /api/auth/, which skipped the refresh), so dashboards no longer fail after a while; a
      sign-in that can't be refreshed shows "You're signed out" with a way back to log in
- [x] 4.6 Notes: a Notes tab on admissions (doctor: progress, admission and case notes; nurse:
      admission notes, case notes, care plans, vital signs, progress notes) and the doctors' shared
      notes on a nurse's check-in; the nurse writes the admission note (and can't work the
      admission's tasks until it's written), case notes, care plans and vitals; the doctor writes
      progress notes; both hand patients over to a colleague, with a Handover notes page. Checked
      on staging (reads: the pages, and every kind's rows parsed in a test)
- [x] Fixed: switching a list's kind (notes, charts, received/sent handovers) no longer shows the
      last kind's rows under the new heading while it loads
- [x] 4.7 Discharge, results, overviews: the doctor discharges an admission in two steps (the
      stay's summary; condition, care instructions, investigations, drugs to take home, follow-up),
      which gives the nurses a discharge checklist task (final vitals, checks, condition,
      education), recorded from the patient's page; a Results page for lab results and scan reports
      to approve or reject (lab results also from the patient's Lab results tab); the doctor's
      overview (waiting patients, appointments, referrals, admissions, admissions and discharges by
      month); the nurse assigns an appointment to a doctor. Checked on staging (reads: every new
      reply parsed in a test)
- [x] Phase 4 done

## Phase 5: Super admin (`admin.` subdomain)

- [x] Login, password reset and routing for `dhadmin`: `admin.<domain>/login` and
      `/forgot-password` send no account type (as the API asks for DH admins); a dhadmin's session
      lands on the admin section from any login, and logging out returns there
- [x] Overview (users, hospitals, individuals, subscribed, revenue; registrations, subscriptions
      and revenue by day, month or year; users by state; individuals with dependants), Users
      (individuals and hospitals, search, deactivate / activate), Facility applications (by
      status, documents, approve with a login link / reject with a reason), Subscription plans
      (add, edit), Settings (change password). Built from v1 with v2's parts (no design).
      Checked on staging (reads: every reply parsed in a test; the login page); nothing was
      approved, rejected, switched off or changed on staging

## Phase 6: Landing pages

- [ ] Mission, Vision, News, DocuHealth API, Privacy, Terms, API Terms, Legal Notice
- [ ] Contact form on the real endpoints

## Phase 7: Before launch

- [ ] Mocks only in tests
- [ ] Every role lands on its own dashboard and can't open another's
- [ ] Staging and production settings checked
- [ ] Full click-through per role on staging
- [ ] Backend gaps file sent
