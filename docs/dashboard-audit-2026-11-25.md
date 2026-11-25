# Dashboard audit (25 Nov 2026)

What each dashboard has, what still waits on the **UI** (no design or not built), and what
still waits on the **API** (marked `TODO(api)` in the code). The backend's side of every API item
is written up in [backend-gaps-v2-migration.md](backend-gaps-v2-migration.md), section 7.

Key: ✅ works on the real API · 🟡 works, with some fields "—" or worked around · ⛔ waiting

## Every staff dashboard

| Area                                          | State               | Waiting on                                |
| --------------------------------------------- | ------------------- | ----------------------------------------- |
| Login, first login, forgot password, NIN gate | ✅                  | —                                         |
| Settings (profile, password)                  | ✅                  | —                                         |
| Health personnel, Appointments (own)          | ✅                  | —                                         |
| **Messages**                                  | ⛔ placeholder page | UI design and API (no messaging endpoint) |
| **Help & support**                            | ⛔ placeholder page | UI design                                 |
| Bell and Messages unread counts               | ⛔ show 0           | API: no notification or unread endpoint   |

## Hospital admin

| Screen                                              | State | Notes                                                                                                                            |
| --------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard banner (staff, added, admins, facilities) | ✅    | New 25 Nov endpoints                                                                                                             |
| Staff by role                                       | ✅    | One call (`staff-role-counts`)                                                                                                   |
| Queue                                               | ✅    | `patients-check-ins`; no check-in reason                                                                                         |
| Staff Mgt. list                                     | 🟡    | API: no `is_admin`, joined date, photo, active filter on the list                                                                |
| Staff profile                                       | 🟡    | New endpoint; API: staff ID, date of birth, access roles, appointments this month                                                |
| Grant / revoke admin                                | ⛔    | API: no endpoint                                                                                                                 |
| Patient Mgt. cards and tabs                         | 🟡    | New endpoints; API: filters by ward / doctor / visit type, sorting, visit type, checked-in by, check-in time on checked-out rows |
| Patient profile                                     | 🟡    | Visits, last visit, history, family now real; API: assigned doctor, which way `guardianship` lists                               |
| Ward Mgt., Audit logs, Add facility, Add staff      | ✅    | Audit logs: API has no search or date filter                                                                                     |
| Wallet                                              | 🟡    | Plans work; API: no wallet balance or transactions                                                                               |

## Receptionist

| Screen                               | State          | Notes                                                                                                                          |
| ------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Dashboard cards                      | 🟡             | New endpoint; two cards need relabelling: "Waiting in queue" is check-ins this hour, "Checked in today" is waiting for a nurse |
| Queue, check-out                     | ✅             | Search by name, HIN or phone; API: check-in reason                                                                             |
| Appointments (tabs, calendar, cards) | 🟡             | New cards; API: reschedule, cancel, one appointment, arrived/in-progress states, slots                                         |
| Booking                              | ⛔             | API requires a staff member the design doesn't ask for                                                                         |
| Patient lookup, profile, check-in    | 🟡             | Profile numbers, history, family now real; API: assigned doctor, department                                                    |
| Register patient, add dependant      | ✅             | API: link an existing child; `confirmed_by` values                                                                             |
| Admissions                           | ✅             | —                                                                                                                              |
| **Patients list page**               | ⛔ placeholder | UI: no design for the list (lookup works)                                                                                      |
| **Staff page**                       | ⛔ placeholder | UI design                                                                                                                      |
| Follow-up requests                   | ⛔             | API: nothing exists                                                                                                            |

## Doctor

| Screen                                          | State | Notes                                                                                                                               |
| ----------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Overview                                        | 🟡    | API: dashboard has no schema or period meaning                                                                                      |
| Patients, patient page, encounters              | 🟡    | API: one admission / check-in endpoint, HIN search, "my consultations" filter                                                       |
| Notes (SOAP, progress, admission, case)         | 🟡    | API: shared SOAP notes return 500; progress notes don't say who wrote them; doctors can't read care plans, vitals history or charts |
| Lab results to review                           | 🟡    | API: rows don't say the patient                                                                                                     |
| Orders (lab, scan, drugs), discharge, handovers | 🟡    | API: duplicate-order warning shape, discharge field rules, handover dates                                                           |

## Nurse

| Screen                    | State | Notes                                                                              |
| ------------------------- | ----- | ---------------------------------------------------------------------------------- |
| Queue, vitals, admissions | 🟡    | API: holders typed as strings; who asked for vitals                                |
| Tasks                     | 🟡    | API: task rows lack their admission and who claimed them; record body undocumented |
| Notes and charts          | 🟡    | API: notes can't be filtered by admission; doctors' notes 500                      |
| Handovers                 | 🟡    | API: no dates                                                                      |

## Lab scientist and lab admin

| Screen                             | State | Notes                                                                          |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------ |
| Overview                           | 🟡    | API: approved results, returning patients, period filter                       |
| Test orders (tabs, upload, review) | 🟡    | API: item-level filter, accepted/rejected times, "seen" flag, source, HMO flag |
| Patient lookup by HIN, booking     | ⛔    | API: 403 for lab staff                                                         |
| Downloads (records PDF)            | ✅    | —                                                                              |

## Radiologist

| Screen                        | State | Notes                                                                                |
| ----------------------------- | ----- | ------------------------------------------------------------------------------------ |
| Overview, scan orders, upload | 🟡    | API: one item endpoint, date filters, counts in one call, "seen" flag, doctor's note |
| Patient lookup by HIN         | ⛔    | API: 403 for radiologists                                                            |

## Pharmacist

| Screen                              | State | Notes                                                                                                     |
| ----------------------------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| Overview, prescriptions, dispensing | 🟡    | API: no dashboard endpoint (lists are counted), trend schema wrong, status values undocumented, no search |
| Walk-in sale                        | ⛔    | API: orders need a check-in or admission                                                                  |

## DocuHealth admin

| Screen                                                            | State          | Notes                                                                                        |
| ----------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| Overview, users, applications, register facility, plans, settings | 🟡             | API: states not normalized, reviewer not recorded, plans can't be retired, documents untyped |
| Help                                                              | ⛔ placeholder | UI design                                                                                    |

## Patient (for completeness)

Every designed screen is built: Home, Health, Test results, Timeline, Trends, Facilities,
Immunization, Conditions, Allergies, Care plans, Visits, Vital signs, Medications, Scans,
Appointments (with booking, reschedule and cancel) and Messages. The real API serves visits,
appointments (read only), medicines, vitals and check-ins; the rest (lab details, scan reports,
allergies, care plans, immunizations, documents, bills, booking, messages…) shows demo data in
`npm run dev` and empty states on live, until the endpoints in the gaps doc's "Patient dashboard
(25 Nov)" section exist. Bills & payments, Family & proxy, Sharing & privacy, Health personnel,
Settings and Help have no design yet.
