# Doctor Dashboard — Backend Issues (open items)

Live against `https://docuhealth-backend-2-4gw8.onrender.com`, doctor JWT
`testingthisthingtoday@gmail.com`.

## Open

Nothing blocking. Both former open items were re-tested with a **fresh** doctor
discharge on 2026-09-03 (admission `jahMRJt`, Glory Kotin) and are resolved on
current code. The earlier "still broken" readings were taken against admissions
discharged on an older build (see the data-cleanup note below).

### Data cleanup (backend) — pre-fix admissions have an orphan nurse task, no form row
Admissions discharged before the current `doc-discharge-form` build (`so6QWET`,
`Rij1BpD`, `16SfVU0`, `9y35KUw`, `xaNLSQu`, `HpDVyEQ`, `ZVWQzSY`, `CebyjGw`, …)
have a `nurse_in_patient_discharge` task (pending or completed) but **no linked
`DoctorDischargeForm` row**. Evidence, 2026-09-03:
- `GET /api/inpatients/discharged-patients` returns only the fresh `jahMRJt`
  (count 1). `ZVWQzSY` has its nurse task **completed** and sits in
  `?status=inpatient_discharge`, yet is still absent — so the form row is
  genuinely missing, it is not a "nurse step pending" filter.
- Those admissions still trip the duplicate guard on re-POST
  (`{"doctor": ["Doctor has already discharged this patient"]}`), so the guard
  keys off the nurse task / an admission flag, not the form row — they cannot
  self-heal by re-discharging.
- Their status is still `active`, not `awaiting_nurse_discharge`.

Action: if these are throwaway QA rows, the FE just stops testing against them.
If any must be real, backend backfills the missing `DoctorDischargeForm` rows or
clears the orphan tasks + guard so they can be re-discharged.

### Open question (needs a nurse execute on staging)
Once a fresh admission goes doctor → nurse full cycle and flips to
`status = discharged`, confirm it **stays** in `discharged-patients` with
`nurse_discharge_form` populated (queryset must not drop `status = discharged`).
Cannot verify from the doctor dashboard alone.

## Resolved on 2026-09-03 (fresh-discharge re-test, admission `jahMRJt`)

### `GET /api/inpatients/discharged-patients` — WORKS
`POST .../doc-discharge-form` → `201`, then `discharged-patients` immediately
returns the admission: full `doctor_discharge_form` (sqid `Sn1aqvp`, all 14
fields incl. `condition_at_discharge`), `nurse_discharge_form: null`, bed still
`occupied`. Inclusion rule is **"a doctor discharge form is linked to the
admission"** (not "nurse step done") — matches `GETTING-IN-PATIENT-DISCHARGE.md`
edge case 1. The doctor "Discharge Summary" view can now be built off this.

### `condition_at_discharge` — WORKS
Required **free-string** field on the serializer (no enum). Sent `"improved"`,
persisted, echoed on `doctor_discharge_form.condition_at_discharge`. The earlier
"not on the serializer" probe was unsound: a bogus value on a free-string field
passes validation and lands on the duplicate guard exactly like an ignored
unknown field would. FE already sends it lowercased — no FE change.

### `awaiting_nurse_discharge` admission status — LIVE
After the doctor discharge, the admission row in
`GET /api/hospitals/patients?status=inpatient` carries
`status: "awaiting_nurse_discharge"` (was `active`) and **stays in the list**
(does not vanish). FE can key the "Discharge initiated, awaiting nurse" badge and
disable the re-discharge action off `row.status === "awaiting_nurse_discharge"` —
no extra per-row `task-occurrences` call needed. `?status=awaiting_nurse_discharge`
as a query filter is **not** accepted (400); the row stays under `inpatient`.

### `GET /api/raw` (OpenAPI schema) — FIXED
No longer 500s on `KeyError(Task.TaskType.SEIZURE_EVENT)`; generates fine
(HTTP 200, ~610 KB). `DoctorInpatientDischargeForm` / `DoctorDischargeFormRead` /
`DischargeSummary` / `NurseDischargeFormRead` are all in the schema.

## Notes for context (not issues)

### `POST .../doc-discharge-form` — fully re-verified 2026-09-03 (17-case matrix)
Every field rule confirmed live (probes land on the duplicate guard once
validation passes, so a field error means that field is wrong):

| Rule | Result |
|---|---|
| 14 required fields | `patient, chief_complaint, primary_diagnosis, secondary_diagnosis, comorbidities, treatment_plan, hospital_course_note, care_instructions, condition_at_discharge, will_continue_followup, follow_up_clinic, follow_up_date, follow_up_time, follow_up_instructions` (`condition_at_discharge` added to the serializer since the first probe; confirmed via the schema + a fresh green-path create on 2026-09-03) |
| `follow_up_date` | `YYYY-MM-DD` only (`22-09-2026` → 400) |
| `follow_up_time` | `hh:mm`, `hh:mm:ss`, `hh:mm:ss.uuuuuu` all accepted (`25:99` → 400). FE sends `hh:mm`. |
| `will_continue_followup` | strict boolean (`"maybe"` → 400); `false` accepted |
| `completed_/pending_investigations[]` | must be objects `{sqid, type}`; `type` is a choice, only `lab_test_order` valid; `type` required per item |
| `discharge_medications[].unit` | accepts a string or `null` |
| required text fields | reject `""` ("may not be blank") |
| `patient` | must be a real HIN (`0000000000000` → 400) |
| genuinely unknown fields | silently ignored (DRF default). NB `condition_at_discharge` is a real required field now, not an unknown one |
| duplicate | `400 {"doctor": ["Doctor has already discharged this patient"]}` (array, not the doc's string — FE handler copes with both) |

The FE `buildDischargePayload()` / `handleValidateAndConfirm()` match this exactly;
full payload passes validation cleanly.

A successful doctor discharge **does** raise a `nurse_in_patient_discharge` task
(`status: pending`) — confirmed visible via
`GET /api/inpatients/admissions/<sqid>/task-occurrences?status=pending` (that
endpoint requires `status` ∈ `pending|in_progress|history`). The admission moves
to `status: awaiting_nurse_discharge` (still returned under
`hospitals/patients?status=inpatient`) and becomes eligible for
`discharged-patients` immediately; a nurse executing the task then flips it to
`status: discharged` and frees the bed.

- `IN_PATIENT_DISCHARGE_HANDOFF (3).md` request body is stale — it omits
  `chief_complaint`, `treatment_plan`, `care_instructions`, `condition_at_discharge`,
  which the live endpoint requires (14 required fields total). Frontend sends all 14.
- Endpoint path migration (`/api/doctors/admissions/<sqid>/discharge-forms` →
  `/api/inpatients/admissions/<sqid>/doc-discharge-form`) is done and live; the
  old route is gone from the `api/doctors` URLconf.
- `follow_up_time` accepts `"HH:MM"` (no seconds needed) — confirmed live; stored
  and returned as `"HH:MM:SS"`.
- drf-spectacular schema (`GET /api/raw`) — **fixed**, no longer 500s on
  `KeyError(Task.TaskType.SEIZURE_EVENT)`; generates fine (HTTP 200).
- **Seizure events** — resolved. `seizure_event` care-task type is deployed
  (`POST /api/inpatients/admissions/{sqid}/tasks`, `config = {characteristics,
  emergency_standing_order}`), `SeizureEventModal` wired to it.
- **Order scan / X-ray** — deliberate coming-soon placeholder in the FAB; no
  radiology module on the backend yet.

Last reviewed 2026-09-03.
