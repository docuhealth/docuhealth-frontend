# In-Patient Discharge: Backend Requests (from frontend)

**Update 2026-09-03:** re-tested with a **fresh** doctor discharge (admission
`jahMRJt`, Glory Kotin, HIN `2078622761625`). Items 1, 2 and 3 below are
**resolved on current code** — the earlier failures were all measured against
admissions discharged on an older build. Item 4 is partly done. Details inline;
see "Verified working" at the bottom for the field contract.

---

## 1. "Awaiting nurse" signal on the inpatient list — RESOLVED

After a fresh doctor discharge, the admission row from
`GET /api/hospitals/patients?status=inpatient` comes back with
`status: "awaiting_nurse_discharge"` (was `"active"`) and **stays in the list**.

```jsonc
{
  "sqid": "jahMRJt",
  "status": "awaiting_nurse_discharge",   // "active" before the doctor discharge
  ...
}
```

`AdmissionStatusEnum` is now
`[pending, active, rejected, cancelled, discharged, awaiting_nurse_discharge]`.

FE — DONE. `row.status === "awaiting_nurse_discharge"` now drives a "Discharge
initiated · awaiting nurse" badge and a disabled re-discharge button in the
Admitted Patients list card (`TabDetails.jsx`), the patient detail action bar
(`Hospital_Doctors_Patients_Dashboard.jsx`) and the detail header
(`AdvanceCheckUp.jsx`). No extra per-row `task-occurrences` request. The list
refetches after a discharge (mutation invalidates `["hospital-patients-doctor"]`).

Notes:
- `?status=awaiting_nurse_discharge` as a **query filter** is rejected (`400`,
  "status must be 'inpatient', 'outpatient', 'inpatient_discharge' or
  'outpatient_discharge'"). The row stays under `?status=inpatient`, which is
  what the FE wants — no separate tab needed.
- Old admissions discharged before this build still read `status: "active"` (they
  predate the transition). See item 3.

---

## 2. `condition_at_discharge` on `doc-discharge-form` — RESOLVED

It is a **required free-string field** on the serializer now (no enum). Verified
2026-09-03: sent `condition_at_discharge: "improved"` on a green-path create, it
persisted and came back on
`GET /api/inpatients/discharged-patients` →
`results[].doctor_discharge_form.condition_at_discharge: "improved"`. Also present
(required) on `DoctorDischargeFormRead` in the schema.

The earlier "not on the serializer" probe was unsound: a bogus string value on a
free-string field passes validation and lands on the duplicate guard exactly like
an ignored unknown field would. Presence can only be probed by *omitting* the
field.

No FE change — `buildDischargePayload()` already sends it lowercased. There are no
enum values to match; any lowercase string persists.

---

## 3. `GET /api/inpatients/discharged-patients` — RESOLVED for new discharges

Fresh test 2026-09-03: `POST .../doc-discharge-form` → `201`, then
`discharged-patients` **immediately** returns the admission:

```jsonc
{
  "count": 1,
  "results": [{
    "admission_sqid": "jahMRJt",
    "admitted_by": { ... },
    "patient_info": { ... },
    "ward_info": { ... },
    "bed_info": { "bed_number": 9, "status": "occupied", ... },  // bed still held
    "admission_date": "2026-09-03T15:00:31Z",
    "discharge_date": null,
    "doctor_discharge_form": {
      "sqid": "Sn1aqvp",
      "chief_complaint": "...", "primary_diagnosis": "...",
      "secondary_diagnosis": "...", "comorbidities": "...",
      "treatment_plan": "...", "hospital_course_note": "...",
      "care_instructions": "...", "condition_at_discharge": "improved",
      "follow_up_clinic": "...", "follow_up_date": "2026-09-15",
      "follow_up_time": "10:30:00", "follow_up_instructions": "...",
      "discharged_by": { ... }, "created_at": "2026-09-03T20:09:16Z"
    },
    "nurse_discharge_form": null
  }]
}
```

Inclusion rule is **"a doctor discharge form is linked to the admission"** (not
"nurse step complete") — the record shows up while the bed is still occupied and
`nurse_discharge_form` is `null`, matching `GETTING-IN-PATIENT-DISCHARGE.md` edge
case 1. Response item schema: `DischargeSummary` (`doctor_discharge_form` +
`nurse_discharge_form`, both nullable).

FE — DONE. `fetchInpatientDischargeSummary({ admissionSqid })` in
`queries/Hospital/doctor/discharge.js` pages this endpoint and matches
`admission_sqid` client-side (no per-admission route; `?admission_sqid` /
`?search` / `?status` are all ignored server-side — confirmed live). New
`DoctorDischargeSummaryView.jsx` renders the doctor block + the nurse block (or an
"Awaiting nurse discharge" panel when `nurse_discharge_form` is null); the doctor
discharged-patient detail "View discharge summary" button (`AdvanceCheckUp.jsx`)
now opens it instead of the medical-records list. Pre-fix admissions with no
record show a "No discharge summary recorded" empty state.

Two things the FE view cannot fully honour until the backend confirms:
- `DoctorDischargeFormRead` omits `will_continue_followup`, `completed_/pending_investigations`
  and `discharge_medications` — accepted on POST, not echoed on read. If the summary
  should show meds / investigations / the follow-up toggle, add them to that serializer.
- The **populated** `nurse_discharge_form` branch is built from the
  `NurseDischargeFormRead` schema only — no staging record has a completed nurse
  discharge yet, so it is unverified against live data.

### Remaining: data cleanup (backend), not a code bug

Admissions discharged on the **older** build (`so6QWET`, `Rij1BpD`, `16SfVU0`,
`9y35KUw`, `xaNLSQu`, `HpDVyEQ`, `ZVWQzSY`, `CebyjGw`, …) have a
`nurse_in_patient_discharge` task (pending or completed) but **no linked
`DoctorDischargeForm` row**, so they never appear in `discharged-patients`:

- `ZVWQzSY` has its nurse task **completed** and sits in
  `?status=inpatient_discharge`, yet is still absent — the form row is genuinely
  missing, it is not a "nurse pending" filter.
- They still trip the duplicate guard on re-POST, so the guard keys off the nurse
  task / an admission flag, not the form row — they cannot self-heal by
  re-discharging.
- Their status is still `active`, not `awaiting_nurse_discharge`.

Ask: if these are throwaway QA rows, we stop testing against them. If any must be
real, backfill the missing `DoctorDischargeForm` rows, or clear the orphan tasks
+ guard so they can be re-discharged.

### Still to confirm (needs a nurse execute on staging)

Once a fresh admission goes doctor → nurse full cycle and flips to
`status: discharged`, confirm it **stays** in `discharged-patients` with
`nurse_discharge_form` populated (the queryset must not drop `status = discharged`).
Not verifiable from the doctor dashboard alone.

---

## 4. Documentation / response cleanups

- **Schema 500** — **fixed.** `GET /api/raw` no longer 500s on
  `KeyError(Task.TaskType.SEIZURE_EVENT)`; the OpenAPI schema generates
  (HTTP 200, ~610 KB).
- **Stale request body.** `IN_PATIENT_DISCHARGE_HANDOFF (3).md`'s doctor request
  body lists 10 fields; the live serializer requires **14** — it also omits
  `chief_complaint`, `treatment_plan`, `care_instructions` and
  `condition_at_discharge`. Please update the doc.
- **Error shape mismatch.** The duplicate-discharge error is
  `{"doctor": ["Doctor has already discharged this patient"]}` (array) live, but
  the doc shows a string. FE handler copes with both; still worth aligning.
- **`GET /api/inpatients/task-occurrences`** (handoff (3) "Quick walkthrough") is
  `403` for a doctor JWT — it is the nurse queue. The doctor-visible equivalent
  is the per-admission `GET /api/inpatients/admissions/<sqid>/task-occurrences`.

---

## Verified working (no change needed)

`POST /api/inpatients/admissions/<sqid>/doc-discharge-form` — 17-case validation
matrix on 2026-09-03, plus a green-path `201` create on admission `jahMRJt` the
same day (`{"detail": "Doctor Discharge form created for in-patient successfully."}`):

- Required fields (14): `patient`, `chief_complaint`, `primary_diagnosis`,
  `secondary_diagnosis`, `comorbidities`, `treatment_plan`,
  `hospital_course_note`, `care_instructions`, `condition_at_discharge`,
  `will_continue_followup`, `follow_up_clinic`, `follow_up_date`,
  `follow_up_time`, `follow_up_instructions`.
- `condition_at_discharge`: required free string, no enum; stored and returned.
- `follow_up_date`: `YYYY-MM-DD` only.
- `follow_up_time`: `hh:mm`, `hh:mm:ss`, and `hh:mm:ss.uuuuuu` all accepted;
  stored / returned as `hh:mm:ss`.
- `will_continue_followup`: strict boolean; `false` is accepted (the follow-up
  fields are still required in that case).
- `completed_investigations` / `pending_investigations`: array of
  `{ sqid, type }` objects; `type` is a choice with only `lab_test_order` valid;
  `type` is required per item.
- `discharge_medications[].unit`: accepts a string or `null`.
- Required text fields reject empty strings.
- Unknown `patient` HIN returns a 400.
- A successful discharge raises a `nurse_in_patient_discharge` task with
  `status: pending`, moves the admission to `status: awaiting_nurse_discharge`,
  and makes it appear in `discharged-patients` (bed not freed until a nurse
  executes the task).
- Repeat discharge → `400 {"doctor": ["Doctor has already discharged this
  patient"]}`.

The frontend payload matches this contract exactly.
