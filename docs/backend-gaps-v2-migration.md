# Backend gaps found during the v2 migration

From the frontend team, while connecting the v2 dashboards to `https://api-staging.docuhealthservices.net`.
Each item says what we found, how to check it, and what we need. Items are added as each
dashboard is connected; the newest are at the bottom.

| #   | Issue                                                                 | Severity                  | Endpoint(s)                           |
| --- | --------------------------------------------------------------------- | ------------------------- | ------------------------------------- |
| 1   | CORS now allows no origin at all (it used to allow localhost:5173)    | Blocker                   | All endpoints                         |
| 2   | Staging still serves Django debug pages (incl. the URL list)          | High (security)           | All endpoints                         |
| 3   | 15 GET endpoints have no response schema in the OpenAPI doc           | Medium                    | Dashboards, charts, events and more   |
| 4   | Old `api/hospitals/*` paths are gone: is production the same?         | Needs an answer           | `api/hospitals/*` → `api/auth/staff…` |
| 5   | Staff list filters work but aren't in the schema                      | Low                       | `GET /api/auth/staff`                 |
| 6   | No endpoint for unread notification and message counts                | Medium                    | Top bar and sidebar badges            |
| 7   | Each dashboard's missing endpoints and fields (receptionist to admin) | Blocker for those screens | Every dashboard and the public site   |

---

## 1. CORS: the v2 test site and subdomains are still blocked

Reported on 18 Nov, still open on 21 Nov, and worse on
24 Nov 2026: the staging API now returns no `Access-Control-Allow-Origin` for **any** origin we
tried, including `http://localhost:5173`, which it used to allow. Any browser app calling staging
directly (v1 included, unless it proxies) can't read the replies.

| Origin                                       | Allowed? (24 Nov) |
| -------------------------------------------- | ----------------- |
| `https://v2.docuhealthservices.net`          | **No**            |
| `https://hospital.v2.docuhealthservices.net` | **No**            |
| `https://admin.docuhealthservices.net`       | **No**            |
| `https://www.docuhealthservices.net`         | **No**            |
| `http://localhost:5173`                      | **No** (was yes)  |
| `http://hospital.localhost:5173`             | **No**            |

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
- [ ] Ideally one regex for every app subdomain, two levels deep, e.g.
      `CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://([a-z0-9-]+\.){0,2}docuhealthservices\.net$"]`
      (plus `r"^http://([a-z0-9-]+\.){0,2}localhost:5173$"` on staging only) and
      `CORS_ALLOW_CREDENTIALS = True`.

---

## 2. Staging still serves Django debug pages

Any unknown path, for example `GET /api/zz-not-a-route`, returns Django's debug 404 page. It lists
the server's URL patterns. A 500 returns the full stack trace. Still the case on 24 Nov 2026.

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

## 7. Each dashboard: what's missing

The new receptionist, lab scientist and hospital admin dashboards were designed before their
endpoints existed. We matched every call they make against the staging API: of 45 calls, 5 match an
endpoint, 33 match partly (missing fields, filters or permissions) and 7 have no endpoint. These
are the asks.

**Settled by the 25 Nov dashboard handoff** (docs/backend-handoff-2026-11-25-dashboards.md, wired
in the app): receptionist 1 (metrics), 2 (check-in list with HIN search), 10 (patient profile:
visits, last visit and check-in, upcoming appointment, history); hospital admin 3 (one staff
member), 5 (overview numbers), 6 (check-in stats), 9 (admin patient profile). Still open from
those: the check-in reason, visit type, "checked in by", staff ID / date of birth, assigned
doctor, and which way `guardianship` lists (guardians or dependants: the app guesses from a null
email). Also: `operation-metrics`' `check_ins_this_hour` isn't the waiting queue, and
`pending_checkins` isn't "checked in today", so those two cards need relabelling or new fields.

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
13. ~~**DOB at desk signup.**~~ Settled by the onboarding guide (24 Nov): `dob` is required, so the registration form now asks for it.
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
11. ~~**Staff creation.**~~ Settled by the onboarding guide (24 Nov): the API emails a temporary password, so the Add Staff dialog no longer sets one.
12. ~~**Add facility.**~~ Settled by the onboarding guide (24 Nov): name and address are required, so the Add Facility dialog now asks for them (country is Nigeria).
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
14. **Task lists' `status`.** `GET /api/inpatients/task-occurrences` and `…/admissions/{sqid}/task-occurrences` refuse a request without `status` (`pending|in_progress|history`), which the schema doesn't list; the schema also says the hospital-wide list is pending-only. Please document it.
15. **Task rows.** `NurseTaskOccurrenceList.summary` is typed as a string but is an object (`parameters`, `drug_name`, `quantity`, `unit`, `frequency`, `tracking_mode`…); rows don't say who claimed them (so the UI can't tell "yours" from a colleague's), nor which admission they belong to (so the Tasks page can't link to the patient).
16. **Recording a task.** `POST …/task-occurrences/{sqid}/execute` describes its body in words only. The UI sends what v1 did (glucose `value/unit/context/insulin_administered`; procedure `consent/post_procedure_status/estimated_blood_volume_ml/current_position`; IV fluid `add_to_patient_fluid_chart/site_condition/cannula_location/nursing_remark`; seizure `duration_minutes/duration_seconds/physical_signs/body_parts_involved/level_of_consciousness/patient_reaction/interventions_administered`; input/output `intake{…}`/`output{…}`); please add per-type request schemas with their enums.
17. **Charts.** `GET /api/records/admissions/{sqid}/charts/{chart}` has no response schema and a free-text `chart`; and it's 403 for doctors (fine for nurses). Doctors need to read the charts for their admitted patients.

18. **Shared SOAP notes.** `GET /api/records/patients/{patient_hin}/soap-notes/shared` returns 500 for doctors and nurses too (see the receptionist's item 15). The nurse's "Doctors’ notes" tab says they aren't available right now.
19. **Progress notes' author.** `ProgressNotesRead` has no `staff_info`, so the notes can't say which doctor wrote them.
20. **Doctors refused.** `GET /api/records/patients/{hin}/care-plans` and `GET …/vital-signs` are 403 for doctors. Doctors should be able to read their inpatients' care plans and vitals history; for now their Notes tab offers progress, admission and case notes only.
21. **Notes per admission.** None of the note lists can be filtered by admission, and only the admission note says which admission it belongs to (`admission_info`). Please add an `admission` filter and `admission_info` to case notes, care plans, progress notes and vitals. The nurse's "admission note written?" check compares `admission_info` with the current admission.
22. **Handovers.** Nurse handovers (received and sent) have no `created_at`; the doctors' list mixes sent and received (no filter), so the UI marks each by comparing with the signed-in doctor; neither can be filtered by patient.
23. **Note shapes.** `CarePlanCreate.goals/intervention/evaluation` are untyped (the UI sends lists, as v1 did); `ListAdmissionNoteRead.allergies` is untyped on read; `mobility_assessment_label` and `nutritional_assessment_label` are required strings but come back `null` when not assessed.

24. **Lab results to review.** `GET /api/lab/doctor-test-order-items` rows don't say the patient or the order, so the Results page can't say whose result it is (it shows "Patient —"; the patient's own Lab results tab has the same buttons). On staging, the three rows approved by the lab admin have `result_info: null`, so there are no values to review. `status` is required but its description leaves out `result_accepted_by_lab_admin`, the one doctors review.
25. **Doctor dashboard.** `GET /api/hospital-ops/dashboards/doctor` has no response schema (it returns `summary.total_*{value, increase}` and `charts.admissions_overview/discharged_patients` by month), and doesn't say which period `increase` compares with, or how `start_date`/`end_date` change it. The nurse dashboard returns only the theme and the nurse's profile, so the nurse overview stays as it is.
26. **Doctor discharge form.** `condition_at_discharge` is free text (the UI sends v1's `stable/improved/unchanged/deteriorated/deceased`); the follow-up rules are undocumented (v1 found: `follow_up_clinic` must be `null` at this hospital; with no follow-up, no date, time or instructions may be sent). Please add an enum and document the rules.
27. **Discharge checklist.** The `nurse_in_patient_discharge` execute body is undocumented (see 16), and it needs `admission_id`, which task rows don't carry (see 15), so the Tasks page sends the nurse to the patient's page to record it.
28. **Assigning appointments.** `PATCH /api/hospital-ops/appointments/{sqid}/assign` doesn't list the `type` values (v1 only sent `consultation`; the UI keeps the appointment's own type), nor who may assign.

### Pharmacy

1. **Walk-in drug orders.** `POST /api/pharmacy/orders/create` needs a `check_in` or an `admission`, so a pharmacist can't sell to a walk-in customer (v1 sent `order_source: "walk_in"`, which the schema doesn't have). Please allow visit-free orders from the pharmacy, or say how walk-ins should be recorded. The walk-in order screen isn't built until then.
2. **Trend response.** `GET /api/pharmacy/orders/trend` is documented as a page of orders, but returns `[{date, count}]`. Please fix the schema, and say what range each `period` covers.
3. **Order status values.** `aggregate_status` has no enum (staging returns `pending`, `partial`, `all_dispensed`, `all_unavailable`), and the list's `status` filter only accepts `pending` and `dispensed`; anything else returns every order. Please document both, and allow filtering by `partial` / `all_unavailable`.
4. **`latest_vitals`** is typed as a string but is an object (or null). Please type it.
5. **Allergies** on a drug record are untyped (staging has `[]` and `["No allergies"]`). A typed list on the order (not per drug) would be clearer.
6. **Pharmacy dashboard numbers.** There's no pharmacy dashboard endpoint; the overview counts lists with `size=1`. A summary (pending, settled, dispensed today/this month, recent patients) would save the calls.
7. **Search** on `GET /api/pharmacy/orders` (patient name or HIN) would help as the list grows.

### DocuHealth admin (`dhadmin`)

1. **No admin profile.** A dhadmin's login returns only `role` and the tokens (no `user`, no `acting_as`), and there's no profile endpoint, so the top bar shows the email they typed and Settings can only change the password. Please add the admin's name and email to the login reply, or a profile endpoint.
2. **Response schemas.** `GET /api/admin/users/{role}` and `GET /api/admin/dashboard/{states,sub-accounts,subscriptions,users,revenue}` have none. Seen on staging: users are `{full_name, email, phone_num, dob, gender, hin, is_active}` and hospitals `{sqid, name, profile_image, address, email, doctors, other_personnel, is_active}`; trends are `[{month, value}]`, with the bucket named `month` even for days and years.
3. **Hospital rows.** `profile_image` is an object (`{id, url, path}`), and `address` comes back as `"None, None, None, None"` when empty. Please send the URL and `null`.
4. **States.** `GET /api/admin/dashboard/states` isn't normalized: `ek`, `oy`, `novascotia`, `string` sit beside `ekiti`, `oyo`. Validating states at sign-up (or mapping them) would make the chart meaningful.
5. **Who reviewed an application.** Approved applications on staging have `reviewed_by` and `reviewed_at` null. Please record them.
6. **Activating and deactivating.** The schema takes hospital sqids (`{facilities: []}`) and patient HINs (`{hins: []}`); v1 sent `{hins}` for hospitals and `{patient_ids}` for patients. The UI follows the schema. The onboarding guide (24 Nov) confirms `{facilities}` for hospitals; patients' `{hins}` still to confirm.
7. **Plans.** There's no way to retire or delete a plan, and `test` plans are listed with the real ones. A new plan has no `paystack_plan_code` until Paystack has it; please say whether the API creates the Paystack plan, and when.
8. **Overview totals** have no change against the period before (the hospital admin's and doctor's dashboards do), and `start_date`/`end_date` aren't explained.

### Public site

1. **Contact and newsletter.** v1's contact form posted to `/api/hospitals/inquiries` and `/api/individuals/inquiries`, which staging no longer has (404), and there's no newsletter endpoint. Please add a contact (or enquiry) endpoint and a newsletter sign-up; the footer's newsletter says it isn't available until then.

### One-time codes (from the 24 Nov SMS handoff)

1. **`Retry-After` behind CORS.** A resend that comes too soon is a 429 with `Retry-After`, but a
   browser on another origin can't read that header unless the API exposes it
   (`CORS_EXPOSE_HEADERS = ["Retry-After"]`). Until then the app counts down 60 seconds.
2. **`destination` isn't documented.** `signup`, `signup/desk` and `signup/upgrade` are documented
   as returning their request body; please add `destination` (and say whether it's top-level or
   under `data`). The app reads either, and shows what was typed if it's missing.
3. **409 `account_exists`** on `signup/verify-code` isn't in the schema either.
4. **Email links.** The server now refuses `login_url`, `redirect_url` and `verify_url` outside an
   allowed list. Please make sure that list has the v2 sites (`v2.docuhealthservices.net` and its
   `hospital.`, `admin.` subdomains), or facility applications, staff creation and arms from v2
   fail with "This link must point to a Docuhealth site."
5. **Refresh docs don't match the API.** `POST /api/auth/refresh` is documented as taking
   `{ "refresh": "<token>" }` and returning `access`. On staging (25 Nov) the login sets the refresh
   token as an `HttpOnly` cookie (`refresh_token`), the refresh works with that cookie and an empty
   body (200, `access_token`), and `{ "refresh": … }` in the body is refused (400). The app uses
   the cookie; please fix the schema so nobody builds the body version.
6. **Patient sign-up's last step.** The redesigned step 3 also asks for a home address and an
   emergency contact, but `signup/complete` takes only `signup_token`, `nin` and `password`, and no
   patient endpoint stores either (the profile update takes name and phone only). They're left out
   of the screen until the API takes them; please say if and where they'll go.

### Patient dashboard (25 Nov)

The patient screens are built to the designs. What the API serves to a signed-in patient today:
visit summaries (`GET /api/records/summaries/{hin}`), appointments
(`GET /api/hospital-ops/appointments/mine`), drug records
(`GET /api/pharmacy/patients/drug-records`) and vital signs (`GET /api/records/vital-signs/mine`).
Everything below has no patient endpoint. The app keeps the shape it needs in
`src/features/patient/api/pending.ts`; until an endpoint exists those screens show their empty
states on staging and live (the mock dev server fills them with demo data).

1. **Allergies.** A list per patient: name, kind (food / medicine / material), reaction, severity
   (severe / moderate / mild), active or past, facility, who recorded it, when, what to avoid, and
   the care team's note. SOAP notes have a free-text `drug_history_allergies`; that isn't enough to
   list them.
2. **Care plans.** `GET /api/records/patients/{hin}/care-plans` is nurse-only. Patients need their
   own: name, status (active / completed / stopped), facility, who set it, started, updated, next
   review, ended, care team, the diagnosis it's for, a goal (target, latest reading, on track), and
   its items (medicine, home monitoring, visit, test).
3. **Lab result values.** A visit summary's `lab_tests_info` has each test's name and status only.
   Patients need each test's values with unit and a normal / low / high flag (the home page's
   "1 of 3 results slightly outside range").
4. **Scan reports and images.** `scans_info` has name and status only. Patients need the progress
   (scanned, images captured, specialist reviewing, report ready, with times), number of images and
   their URLs, body part, type, who reported it and when, the impression and the full findings.
5. **Visit type.** Each visit summary should say if it was outpatient, an admission (nights stayed,
   discharged or not), an emergency or a lab-only visit, and list next steps (follow-up booked,
   repeat tests). The Visits filter (Outpatient / Admissions / Emergency) depends on it.
6. **Medicine details.** Drug records lack who prescribed them and where, the pharmacy, who
   dispensed them, refills, payment status, plain-language instructions and the end date. Please
   add them (or the prescribing visit's id) to `drug-records`, and type `lab_tests_info`,
   `scans_info` and `drug_orders_info` in the summary schema (they're `string` but arrive as lists).
7. **Patient profile.** Blood group, genotype, documents (list and upload), immunizations (doses
   given and due), the outstanding bill across facilities, and blood glucose readings. None has a
   patient endpoint. `GET /api/patients/dashboard` returns one SOAP note; please say what it's for.
8. **Condition status.** A diagnosis has no active / resolved status, ICD code or plain-language
   explanation, so the app treats the latest visit's diagnosis as active.
9. **Patient appointments.** `POST /api/hospital-ops/appointments/book` is for receptionists.
   Patients need to book (facility, department, reason, note, a free slot), see free slots per
   day, reschedule (409 when the slot was taken meanwhile), cancel with a reason, and confirm
   attendance. Also: departments and visit reasons per facility, the consultation fee, the
   appointment's length, reminders, the clinician's role and photo, and the facility's address
   and photo.
10. **Messages.** No chat endpoint exists: conversations with unread counts, a conversation's
    messages (with read state and shared records), sending, starting a chat, and the staff a
    patient can message per facility and role. The sidebar's unread badge needs the count.
11. **Lab test details.** Beyond item 3's values: reference ranges, specimen and its time, when
    it was resulted, the lab's name, progress stages (collected, received, testing, ready),
    amendments (what changed, why, by whom, and the original), word results (e.g. "Negative" with
    the method), a plain-language explanation, and each value's history for the trend.
12. **Facilities and immunizations.** A facility's location and photo; immunization records
    (vaccine, doses with date, brand, batch, who gave them, where; the next dose due).
13. **Bills and payments.** No patient billing exists: outstanding balance per facility with due
    date, bills (invoice number, services charged, amount billed, paid by the patient, HMO
    contribution, outstanding), payment history (method, reference, declined attempts), and
    paying (card through the processor, bank transfer details per facility, POS), with a receipt.
14. **Sharing and consent.** No endpoint to share a record: start a share (facility, person,
    record parts, duration, reason) confirmed by a one-time code, get the access code and
    secure link, list and stop active shares, the access history (who viewed what, when), and the
    patient's privacy settings.
15. **Family & proxy (wired on the real API).** Gaps: no way to change a proxy's powers without
    ending the grant (the app's "Save changes" waits for one); no HIN lookup before sending a proxy
    request, so the proxy's name is only known after; `duration_days` has no "no end" (the app sends
    36 500); a dependant has no relationship, primary contact or consent in the reply; no titles
    ("Mrs."); and a dependant's photo, due vaccines and growth (weight, height, BMI with
    percentiles) have no source. `GET /api/patients/guardianship` (25 Nov handoff) isn't in the
    published schema yet.
