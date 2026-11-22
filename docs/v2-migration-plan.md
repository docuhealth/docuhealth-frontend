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
- [ ] Doctors and nurses still land on the admin dashboard until phase 4

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

- [ ] Shared: patient lists, patient page, encounter timeline, discharged record, pickers
- [ ] Doctor: overview, encounter queue, SOAP note, orders, admission / transfer / referral, care
      tasks, discharge, result review, progress and handover notes
- [ ] Nurse: overview and vitals requests, nursing encounter, task queue and charts, admission
      note, case notes, care plans, vitals, discharge checklist, assign appointments, handover
- [ ] If time allows: medication history, care activity feed, issued-task history

## Phase 5: Super admin (`admin.` subdomain)

- [ ] Login, password reset and routing for `dhadmin`
- [ ] Overview, users (activate / deactivate), subscription plans, facility applications, settings

## Phase 6: Landing pages

- [ ] Mission, Vision, News, DocuHealth API, Privacy, Terms, API Terms, Legal Notice
- [ ] Contact form on the real endpoints

## Phase 7: Before launch

- [ ] Mocks only in tests
- [ ] Every role lands on its own dashboard and can't open another's
- [ ] Staging and production settings checked
- [ ] Full click-through per role on staging
- [ ] Backend gaps file sent
