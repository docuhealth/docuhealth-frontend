# Patient dashboard: plan

The patient side, built like the staff dashboards: its own feature (`src/features/patient/`),
routes under `src/routes/patient/` that put it together, shared parts from `src/components/`.
It lives on the main site (`v2.docuhealthservices.net/patient/...`). Designs come in batches;
this file tracks each screen, the API behind it, and what's missing.

## Structure

```
src/features/patient/
  api/          queries, mutations, schemas (the API's shapes → screen models)
  components/   patient-sidebar, patient-top-bar, home, health, record lists and details
  lib/          labels, formatting
src/routes/patient/
  route.tsx                   the shell: sidebar + top bar; requireDashboard("/patient")
  index.tsx                   Home
  health/index.tsx            Health
  health/conditions/…         list + $id detail
  health/allergies/…          list + $id detail
  health/scans/…              list + $id detail + $id/viewer
  appointments, messages, bills, family, sharing, personnel, settings, help   (next batches)
src/mocks/patient.ts          demo data for npm run dev
```

Sidebar: Home, Health, Appointments, Messages, Bills & payments · Manage: Family & proxy,
Sharing & privacy, Health personnel · Settings, Help & support, Log out. Top bar: page title +
HIN, search, notifications, avatar.

## Screens in batch 1 and their API

| Screen                                                               | API                                                                                                 | Missing (shown as "—" / empty, TODO(api))                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Home: upcoming appointment                                           | `GET /api/hospital-ops/appointments/mine`                                                           | Reschedule from the patient side                                             |
| Home: needs your attention                                           | medications: `GET /api/pharmacy/patients/drug-records`; results: `GET /api/records/summaries/{hin}` | Outstanding bills (no billing API); a "new" flag on results                  |
| Home: health snapshot (BP, weight, BMI, glucose)                     | latest `vital_signs_info` in `GET /api/records/summaries/{hin}`                                     | Blood glucose isn't a vital sign field; "since 1 Sep" change needs history   |
| Health: documents, upload                                            | —                                                                                                   | No patient document endpoint                                                 |
| Health: healthcare facilities                                        | `hospital_info` across summaries and appointments                                                   | No "connected facilities" endpoint                                           |
| Health summary: blood group, genotype                                | —                                                                                                   | Not in any patient endpoint                                                  |
| Conditions (list, detail)                                            | `primary_diagnosis` in summaries                                                                    | Active vs resolved, ICD code, "what this means", related meds/plans          |
| Allergies (list, detail)                                             | —                                                                                                   | No patient allergy endpoint (staff notes carry them as free text)            |
| Scan results (list, detail, viewer)                                  | `scans_info` in summaries (untyped)                                                                 | Status (awaiting/final), images, report text, progress steps for the patient |
| Records: lab, vitals, medications, care plans, visits, immunizations | summaries (lab, vitals, visits), drug records (medications)                                         | Immunizations; care plans for the patient (the endpoint is for staff)        |

`GET /api/patients/dashboard` is documented as returning a SOAP note, which doesn't fit a
dashboard; it needs checking with a patient account.

## Built (25 Nov)

- Shell: sidebar (with Settings at the bottom), top bar with the page's title over the HIN or
  counts, and a back link on detail pages. Sections without designs yet show "on its way".
- Home: upcoming appointment (or "Nothing booked"), needs your attention (recent results,
  medications, latest prescription; bills not available), health snapshot (BP, weight with the
  change since the reading before, BMI; glucose not available).
- Health: record search, documents (upload not available), facilities, health summary, and a
  card per kind of record with counts.
- Conditions (active = the latest visit's diagnosis) and their details; Allergies and Care plans
  (empty: no patient API); Scan results by facility and their details (no images or report yet);
  Visits (upcoming appointments, past visit summaries) and a visit's summary; Vital signs (latest
  readings, earlier sets); Medications (current / past, dispensing and prescription dialogs).
- Not yet: Trends (needs a two-series chart), lab results list, immunizations, the viewer,
  and the sidebar's other sections.
- Buttons use the usual shape, not the designs' pills.

## Needed to finish

- A staging **patient** test account (none of ours is a patient), to read the real replies.
- The remaining screens: appointments, messages, bills, family & proxy, sharing & privacy,
  health personnel, settings, the other record lists, and the components sheet.
- The backend's answer on the missing data above (it goes in the gaps file once confirmed).

## Built (25 Nov, second pass)

Every screen in the designs now has its populated and empty state: Home, Health, Conditions (+
details), Allergies (+ details), Care plans (+ details), Visits (+ summary, + no-summary), Vital
signs, Trends, Medications (+ dispensing and prescription dialogs, PDF download), Scans (+ report
ready, + awaiting report, + image viewer). Record pages have a back arrow.

Data: the real API gives visit summaries, appointments, drug records and the vitals history
(`/api/records/vital-signs/mine`). Everything else the designs show is in
`src/features/patient/api/pending.ts` (TODO(api)): demo data on the mock dev server
(`src/mocks/patient-pending.ts`), empty on staging and live. The backend asks are in
docs/backend-gaps-v2-migration.md, "Patient dashboard (25 Nov)".
