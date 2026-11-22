# Backend gaps found during the v2 migration

From the frontend team, while connecting the v2 dashboards to `https://api-staging.docuhealthservices.net`.
Each item says what we found, how to check it, and what we need. Items are added as each
dashboard is connected; the newest are at the bottom.

| #   | Issue                                                                | Severity                  | Endpoint(s)                           |
| --- | -------------------------------------------------------------------- | ------------------------- | ------------------------------------- |
| 1   | CORS still rejects the v2 test site and every subdomain              | Blocker                   | All endpoints                         |
| 2   | Staging still serves Django debug pages (incl. the URL list)         | High (security)           | All endpoints                         |
| 3   | 15 GET endpoints have no response schema in the OpenAPI doc          | Medium                    | Dashboards, charts, events and more   |
| 4   | Old `api/hospitals/*` paths are gone: is production the same?        | Needs an answer           | `api/hospitals/*` → `api/auth/staff…` |
| 5   | Staff list filters work but aren't in the schema                     | Low                       | `GET /api/auth/staff`                 |
| 6   | No endpoint for unread notification and message counts               | Medium                    | Top bar and sidebar badges            |
| 7   | The redesigned dashboards need endpoints and fields that don't exist | Blocker for those screens | Every dashboard                       |

---

## 1. CORS: the v2 test site and subdomains are still blocked

Reported on 18 Nov (`backend-handoff-2026-11-18.md`, item 2) and still open on 21 Nov 2026. The
staging API returns no `Access-Control-Allow-Origin` for:

| Origin                                           | Allowed? |
| ------------------------------------------------ | -------- |
| `https://v2.docuhealthservices.net`              | **No**   |
| `https://hospital.v2.docuhealthservices.net`     | **No**   |
| `https://admin.docuhealthservices.net`           | **No**   |
| `http://hospital.localhost:5173`                 | **No**   |
| `http://localhost:5180` (any port but 5173/5174) | **No**   |

To reproduce:

```bash
curl -s -o /dev/null -D - -X OPTIONS https://api-staging.docuhealthservices.net/api/auth/login -H "Origin: https://hospital.v2.docuhealthservices.net" -H "Access-Control-Request-Method: POST"
```

For local work the frontend now proxies `/api` through its dev server, so this no longer blocks
development. **It still blocks every deployed v2 environment**: none of the dashboards can call
the API from `*.v2.docuhealthservices.net`, and the super admin dashboard (`admin.…`) can't at all.

**Asks:**

- [ ] Allow `https://v2.docuhealthservices.net` and its `hospital.`, `admin.` and `agent.` subdomains
      on staging.
- [ ] Allow `https://admin.docuhealthservices.net` and `https://agent.docuhealthservices.net` on
      production before launch.
- [ ] Ideally one regex for every app subdomain, two levels deep (see the 18 Nov handoff).

---

## 2. Staging still serves Django debug pages

Any unknown path, for example `GET /api/zz-not-a-route`, returns Django's debug 404 page. It lists
the server's URL patterns. A 500 returns the full stack trace.

**Ask:**

- [ ] Set `DEBUG = False` on staging, and return JSON for 404 and 500
      (`{"detail": "Not found."}`).

---

## 3. Endpoints without a response schema

The OpenAPI schema at `GET /api/raw` is what the frontend now builds against (it's saved in
`docs/api/` by `npm run api:schema`). These GET endpoints document no response body, so the
frontend has to read shapes from live responses, which breaks silently if they change:

- `/api/admin/dashboard/revenue`, `/states`, `/sub-accounts`, `/subscriptions`, `/users`
- `/api/admin/users/{role}`
- `/api/hospital-ops/dashboards/hospital`, `/nurse`, `/receptionist`
- `/api/hospital-ops/patients`
- `/api/lab/dashboard`
- `/api/patients/{hin}/payment-category`
- `/api/radiology/activity-chart-data`
- `/api/records/admissions/{sqid}/charts/{chart_type}`
- `/api/records/events/{sqid}`

**Ask:**

- [ ] Add response serializers (`@extend_schema(responses=…)`) to these views.

---

## 4. Old paths are gone: is production on the same API?

The v1 frontend still calls paths such as `api/hospitals/staff`, `api/hospitals/staff/profile`
and `api/hospitals/dashboards/receptionist`. On staging these return 404; the equivalents are now
`api/auth/staff`, `api/auth/staff/profile` and `api/hospital-ops/dashboards/receptionist`.

**Questions:**

- [ ] Does production already have the new paths, or does it still serve the old ones? v2 is being
      built against staging's paths.
- [ ] Is there a list of every path that moved, so the v1 app (still live) can be checked too?

---

## 5. `GET /api/auth/staff`: document `search` and `role`

The Health Personnel page filters the staff list with `?search=` (name or email) and `?role=`
(for example `nurse`). Both work on staging, but the schema only lists `page` and `size`.

**Ask:**

- [ ] Add `search` and `role` to the view's documented filters, so they're kept on purpose.

---

## 6. Unread counts for the top bar and sidebar

Every dashboard shows a bell with the number of unread notifications, and a badge on Messages
with unread messages. Neither number is in `GET /api/auth/staff/profile`, and there's no
notifications or messages endpoint in the schema, so the app shows 0 for both.

**Questions:**

- [ ] Are notifications and messages planned for launch? If so, which endpoints (or fields on the
      staff profile) will carry the unread counts?
- [ ] Is a staff member's title (e.g. "Dr.") stored anywhere? The greeting would use it.

---

## 7. Redesigned dashboards: what's missing

The new receptionist, lab scientist and hospital admin dashboards were designed before their
endpoints existed. We matched every call they make against the staging API: of 45 calls, 5 match an
endpoint, 33 match partly (missing fields, filters or permissions) and 7 have no endpoint. The
call-by-call table is in `docs/api-mapping-redesigned-dashboards.md`. These are the asks.

### Receptionist

1. **Reception metrics.** Extend `GET /api/hospital-ops/dashboards/receptionist` (or add an endpoint) with `total_check_ins`, `checked_in_today`, `waiting_in_queue`, `appointments_today` and their changes against the previous period, taking `start_date/end_date` like `dashboards/hospital`.
2. **Reception queue.** Add a receptionist-readable check-in list (or confirm `hospital-ops/patients?status=outpatient` is meant for this) with `reason`/visit purpose and a `status` that says waiting vs with nurse vs with doctor. Allow searching by HIN.
3. **Check-out permission.** Confirm a receptionist may `POST /api/hospital-ops/check-ins/{sqid}/close`, or add a receptionist check-out endpoint.
4. **Appointment reschedule and cancel.** Add `POST /api/hospital-ops/appointments/{sqid}/reschedule {scheduled_time, note}` and `…/cancel {reason, details}` for receptionists, notifying the patient. Or confirm the receptionist may use `PATCH …/{sqid}/assign` for rescheduling.
5. **Single appointment.** Add `GET /api/hospital-ops/appointments/{sqid}`.
6. **Appointment ↔ check-in link.** Add arrived/checked-in state on appointments (or a `check_in` reference) so the UI's `arrived/checked_in/in_progress` statuses have a source.
7. **Booking without choosing staff.** Make `staff` optional on `appointments/book` (front-desk/unassigned booking). The redesigned booking dialog has no doctor picker (design kept as is), so front-desk booking fails with `staff: This field is required.` until then.
8. **Slots.** Hospital appointment capacity (`open_slots`, `total_slots` for a date range) for the calendar summary, or the design drops those numbers.
9. **Search by HIN** on `GET /api/hospital-ops/appointments` (and a `patient=<hin>` filter), so a profile can show the upcoming appointment.
10. **Front-desk patient profile.** A receptionist patient endpoint (or extend `/api/patients/{hin}/details`) with `last_visit {at, department}`, `last_check_in {at, status}`, `upcoming_appointment`, `assigned_doctor`, visit history (check-ins + appointments, with in/out times), `dependants[]` and `proxies[]` (with relationship, dob, gender, last visit), and a photo URL.
11. **Doctor follow-up requests.** An endpoint for doctors to request a follow-up appointment and for the front desk to list (per patient) and confirm/cancel them. Nothing exists today.
12. **Link an existing patient as a dependant** (`POST /api/patients/{hin}/dependants` with an existing child HIN), and clarify what `confirmed_by` should contain (enum?).
13. **DOB at desk signup.** `POST /api/auth/signup/desk` requires `dob`, but the redesigned registration form has no date-of-birth field (design kept as is). Please make `dob` optional (the patient can add it later); until then, desk registration fails with `dob: This field is required.`
14. **Coverage values.** API `company` vs UI `nhis`: agree on one list.
15. `GET /api/records/patients/{hin}/soap-notes/shared` returns **500** for the receptionist (ValueError). Bug report.
16. **Admission requests: `processed_by_info`.** The schema marks it required, but older accepted and rejected requests return `null` (seen on staging). Please mark it nullable, or backfill it.

### Lab scientist

1. **Patient lookup for lab staff.** Let lab scientists (and lab admins) resolve a HIN, e.g. allow `GET /api/patients/{hin}/details`, or add `GET /api/lab/patients/{hin}`. Today both are 403.
2. **Lab overview metrics.** Add `approved_results` and `returning_patients` to `GET /api/lab/dashboard`, and honour `start_date/end_date` (or `period`).
3. **Item-level list filter.** Let `GET /api/lab/test-orders` return/filter **items**, or accept several statuses (`status=sample_collected,in_progress`), and return per-status counts in one call.
4. **Missing order fields.** Add `accepted_at` and `rejected_at` on items; `seen`/`viewed_at` for the "New" badge; source (`check_in`/`admission`/appointment) in the live response; patient `payment_provider`/HMO flag; pregnancy status on the order.
5. **Parent order on review items.** Add `order_sqid` to items in `results-for-review`.
6. **Booking permission.** Confirm lab scientists may `POST /api/hospital-ops/appointments/book`, and consider a test reference on lab appointments (the `type` is free text today).
7. **Single-call result upload.** Optionally accept `specimen_collected_at` in `result/submit` to save a round trip.
8. **`is_admin` in the staff profile**, so the UI can show lab-admin approval actions without the login payload.
9. **Order-level result review.** The lab admin approves or returns results one test at a time (`PATCH /api/lab/test-orders/items/{item}/result/approve-by-lab-admin` and `…/reject-by-lab-admin`); the UI reviews a whole order by sending one request per test. An order-level endpoint would save the round trips and keep an order from being half approved if one request fails.
10. **Typed `result_info`.** It's typed as a string in the schema but is an object (values, interpretation, status…). A typed schema, with its `status` values (`pending`, `lab_admin_rejected`, `accepted`…), would let the UI show where each result stands.
11. Spec fixes: `result_info` should be typed as an object; `GET /api/lab/dashboard` needs a response schema.

### Hospital admin

1. **Staff list fields and filters.** Add `is_admin`, `date_joined`/`added_at`, `added_by`, `specialization` and a photo URL to `GET /api/auth/staff` rows. Support `is_active` and `is_admin` filters, plus a summary of total/admins.
2. **Grant/revoke admin.** Add an endpoint (e.g. `PATCH /api/auth/staff/{sqid}/update {is_admin}`), and accept `is_admin` on `staff/create`.
3. **Single staff member.** Add `GET /api/auth/staff/{sqid}` with dob, staff code, added by, and activity stats for a date range (patients seen, appointments, completed, next appointment, follow-ups).
4. **Facility arms list.** Add `GET /api/auth/facility/arms` (sqid, type, name, status) for the facilities count, and to target `facility` when adding staff.
5. **Admin overview numbers.** Staff added this/last month, admin count and facility count, ideally in `GET /api/hospital-ops/dashboards/hospital`, or confirm the design should show the existing discharge/bed metrics instead.
6. **Patient check-in stats.** Total check-ins, new check-ins and returning patients for a date range, with changes.
7. **Patient list filters.** Support `ward`, `doctor`, `visit_type`, a date range and `ordering` on `GET /api/hospital-ops/patients`, plus per-status counts in one response.
8. **Missing row fields.** Check-in time on `outpatient_discharge` rows; visit type (appointment/emergency/walk-in/follow-up) on check-ins; `checked_in_by`. Also a response schema for this endpoint.
9. **Admin patient profile.** Allow hospital admins `GET /api/patients/{hin}/details` (or confirm `/info` is meant for admins), and add assigned doctor, last visit, last check-in, upcoming appointment and a visit history list.
10. **Undo after remove.** Clarify whether `staff/reactivate` restores a _removed_ member, or whether removal is final.
11. **Staff creation.** Confirm how passwords work on `staff/create`: the Add Staff dialog asks for one and puts it in the welcome message, but the API doesn't accept one, so the password in the email won't work. (The UI now uses the API's role list; "Records officer" is gone.)
12. **Add facility.** `POST /api/auth/facility/arms` requires the facility's `name`, `street`, `city`, `state` and `country`, which the Add Facility dialog doesn't ask for (design kept as is). Please make them optional (defaulting to the hospital's own address, say); until then adding a facility fails with those fields' errors.
13. **Staff list filters.** `GET /api/auth/staff` ignores `is_active`, so the Staff Management filters (On team / Removed) read the whole team and filter in the browser. Fine for now; a filter would be needed for large hospitals.
14. **Wallet.** There's no wallet endpoint (balance, transactions, top-up). The admin's Wallet page shows the balance as "Not available yet" and offers the subscription plans, which do exist.
15. **Subscribing.** `POST /api/payments/subscribe` is documented as returning a `Subscription`, but v1 relied on an `authorization_url` (Paystack checkout) in the reply. Please document it, and confirm `plan` takes the `paystack_plan_code` (as v1 sent) rather than the plan's `sqid`. The UI opens the link when it's there. (Not tried on staging, to avoid starting a real payment.)
16. **Current subscription.** `FacilityProfile.subscription` (in `GET /api/auth/facility`) is typed as a string, but v1 reads it as `{status, plan_name}`. Please type it. The status enum also differs from v1 (`non_renewing` vs `non-renewing`; no `past_due`/`expired`).
17. **Audit logs.** `GET /api/audits/audit-logs` has no search, date or staff filter, and `before_state`/`after_state` are untyped. Fine for now; filters would help as logs grow.

### Radiologist

1. **Single scan order.** Add `GET /api/radiology/orders/items/{item_sqid}`. Without it, the order
   page has to search all four status lists to find one item.
2. **Date filters.** Let `GET /api/radiology/orders/items` take `start_date`/`end_date` (or
   `period`) and `ordering`, so the overview numbers and the orders list can follow the "This
   week / This month" selector and the Latest/Oldest sort.
3. **Per-status counts in one call** on `GET /api/radiology/orders/items`, instead of four requests.
4. **Patient lookup by HIN.** `GET /api/patients/{hin}/details` and `/info` are 403 for
   radiologists, and `GET /api/radiology/patients` ignores `search` and `hin`. Book Appointment
   can only find patients who already have a radiology order.
5. **Missing item fields:** `accepted_at`, `rejected_at`, a `seen`/`viewed_at` flag for the "New"
   badge, the source (appointment or doctor request), the doctor's note, and the patient's HMO flag.
6. **Booking permission.** Confirm radiologists may `POST /api/hospital-ops/appointments/book` for
   themselves.

### Doctor and nurse

1. **One visit.** There's no `GET` for a single admission or check-in, so a patient page finds its visit by paging `GET /api/hospital-ops/patients?status=…` (100 at a time). Please add `GET /api/hospital-ops/admissions/{sqid}` and `GET /api/hospital-ops/check-ins/{sqid}`.
2. **Search by HIN.** `GET /api/hospital-ops/patients` and `GET /api/hospital-ops/admissions` search by name only; a HIN finds nothing. Clinical staff look patients up by HIN.
3. **Patient lists' response schema.** `GET /api/hospital-ops/patients` has no response schema and no documented `page`/`size`; each list's rows differ (`status`, `ward_info`, `bed_info`, `requested_by_info`, `closed_by_info`, `discharged_by_info`, `discharge_date`).
4. **Queue holders.** `NurseCheckInQueue.reserved_by` / `claimed_by` / `escalated_by` / `latest_vitals` are typed as strings but are objects (or null). The UI decides "claimed by you" by comparing the holder's sqid with the signed-in member's; please type them, with the staff sqid.
5. **Vitals requests: who asked.** `VitalSignsRequest.staff_info` is the nurse it's meant for; nothing says which doctor asked. Please add `requested_by_info`.
6. **`bmi` in `VitalSignsWrite`.** BMI is read back on vitals but can't be sent; the UI shows it worked out from height and weight. Confirm the backend computes it.
7. **Visit records.** `WorkflowRecordEvent.record` is untyped, so the timeline shows each record's fields generically. A typed record per `record_type` would let it show them properly.
8. **"My consultations".** `GET /api/hospital-ops/check-ins/doctor-queue` has no filter for the doctor who claimed a check-in, so the UI reads the whole active list to know which consultations are the signed-in doctor's (only they may write notes and orders). A `claimed_by=me` filter would do.
9. **SOAP note write fields.** `POST /api/hospital-ops/soap-notes`: `vital_signs` is an integer, but vitals are identified by sqid everywhere else, so the UI can't attach the latest vitals; `referred_docuhealhosp` is misspelt (the read side says `referred_docuhealth_hosp`); `investigation_docs` takes URLs, with no upload endpoint for the files. The form leaves these out for now.
10. **SOAP notes across patients.** `GET /api/records/soap-notes` is 403 for doctors; fine if it's meant for admins, but say so.
11. **Repeat lab orders.** `POST /api/lab/test-orders/create` refuses a test ordered lately with a 400 `duplicate_warning` (resent with `ignore_duplicate_warning: true`); the warning's shape isn't in the schema. Please document it (a message, and which tests).
12. **Catalogue searches.** `GET /api/radiology/scans` and `GET /api/pharmacy/drugs/autocomplete` return plain lists, though the schema lists `page`/`size`. Fine as they are; please make the schema match.
13. **Drug duration units.** `ValueRate.rate` is free text on drug orders (staging has `days`, `Day`, `Month`), while care tasks use an enum (`hours|days|weeks|months`). The UI sends `days|weeks|months`; please make it an enum.

### Pharmacy

1. **Walk-in drug orders.** `POST /api/pharmacy/orders/create` needs a `check_in` or an `admission`, so a pharmacist can't sell to a walk-in customer (v1 sent `order_source: "walk_in"`, which the schema doesn't have). Please allow visit-free orders from the pharmacy, or say how walk-ins should be recorded. The walk-in order screen isn't built until then.
2. **Trend response.** `GET /api/pharmacy/orders/trend` is documented as a page of orders, but returns `[{date, count}]`. Please fix the schema, and say what range each `period` covers.
3. **Order status values.** `aggregate_status` has no enum (staging returns `pending`, `partial`, `all_dispensed`, `all_unavailable`), and the list's `status` filter only accepts `pending` and `dispensed`; anything else returns every order. Please document both, and allow filtering by `partial` / `all_unavailable`.
4. **`latest_vitals`** is typed as a string but is an object (or null). Please type it.
5. **Allergies** on a drug record are untyped (staging has `[]` and `["No allergies"]`). A typed list on the order (not per drug) would be clearer.
6. **Pharmacy dashboard numbers.** There's no pharmacy dashboard endpoint; the overview counts lists with `size=1`. A summary (pending, settled, dispensed today/this month, recent patients) would save the calls.
7. **Search** on `GET /api/pharmacy/orders` (patient name or HIN) would help as the list grows.
