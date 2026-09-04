# Verification of "Frontend Change Handoff — Backend Issues Round"

**Re-tested:** 2026-08-27, then **2026-08-31** for the handover/refer-out ID
fixes (`DOC-FE-BLOCKER-FIXES-2.md`), then **2026-08-31 round 3** for
`BACKEND_FIXES_SCHEMA_AND_HANDOVER_md.md` — live against
`https://docuhealth-backend-2-4gw8.onrender.com` with a doctor JWT
(`testingthisthingtoday@gmail.com`, user_id 191). Schema pulled from
`/api/raw?format=json`.

---

## Round 3 (2026-08-31) — `BACKEND_FIXES_SCHEMA_AND_HANDOVER_md.md`

All items verified live, including real green-path creates. Test records left on
staging: handover `RzGUwxK` (FUTU-DR001 → FUTU-DR002, patient `9976831721726`),
referrals `CzAumyZ` / `YjXNisx` (appt `sr5TcHi` → Memorial `hJ6K8TE`) and
`e2hlNCX` (appt `584f3qI` → MoreLife `ScsWuLT`), vitals request `nSHWrRV`
(patient `9976831721726`). No delete endpoints are exposed for these.

| Item | Result |
|---|---|
| **A1** handover 8 structured fields | ✅ `DoctorHandoverCreate` / `DoctorHandoverRead` both carry all 8; `handover_notes` removed from the schema. Required: `to_doctor_id, patient_hin, working_diagnosis, current_clinical_status`; other 6 `nullable`. Green create round-tripped all 8. New rule: self-handover → `400 {"to_doctor_id":["Cannot handover to yourself."]}`. |
| **A2** handover 201 body | ✅ `{"detail": "Handover created successfully."}` (not the echoed body). |
| **A2** refer-out 201 body | ✅ `{"detail": "Referral created successfully.", "referral_sqid": "<sqid>"}` — `referral_sqid` present. Ran 3 real creates. No duplicate protection. |
| **A2** "appointment isn't yours" | ⚠️ backend doc: `400 {"appointment_id": "appointment isn't yours."}`. Not reproduced live (every appt the test doctor sees is treated as theirs). `extractApiErrorMessage` handles the shape. |
| **B1** discharge content-type | ✅ schema now `multipart/form-data` only. JSON → `415`. FE-shaped multipart body accepted through serialization (fails only at admission lookup). `discharge.js` matches. |
| **B1** vitals handoff path | ⚠️ still a doc typo: `POST /api/medical-records/vital-signs/request` → `404`; real path `POST /api/doctors/vital-signs/request` works, `staff_id` optional (`{patient_hin, note}` alone → `201`, `staff: null`). |
| **C** progress-notes required | ✅ `ProgressNotes.required` now lists `subjective, objective, assessments, plan` (+ `patient, admission`). |

**FE work — DONE (2026-08-31):** handover create form wired.
`createDoctorHandover` sends the 8 fields (no `handover_notes`);
`PatientHandoverTab.handleAddNote` is a real `useMutation` (invalidates
`["doctor-handovers"]`, toasts `res.detail`); `AddHandoverNoteForm` exports
shared `HANDOVER_FIELDS` + has an "Uploading..." state; `HandoverNoteDetailPage`
renders the 8 fields; `SelectHandoverDoctorModal` filters out self via
`profile.sqid`. `vite build` passes. Exact FE payload green-path verified live
(`MZuwEXD`). Refer-out and discharge needed no code changes.

Extra test rows left on staging from this pass: handovers `JnmLeDH`, `OlhZfMB`,
`7Ep5WMt` (optional-field encodings), `MZuwEXD` (FE payload shape).

## Frontend implementation status (2026-08-27)

| # | Endpoint | FE status |
|---|---|---|
| 1 | vitals `staff_id` optional | ✅ **done** — `RequestVitalsModal.jsx` now has a "Continue without a nurse" path (omits `staff_id`) |
| 2+3 | inpatient discharge (`POST /api/medical-records/discharge`) | ✅ **done** — `InpatientDischargeSummary.jsx` wizard now submits (multipart) via `queries/Hospital/doctor/discharge.js`; added Chief complaint + Treatment plan + Care instructions inputs |
| 4 | handover | 🟡 **read side wired; create held** — `queries/Hospital/doctor/handover.js` added; `SelectHandoverDoctorModal.jsx` now keys on `sqid`; `PatientHandoverTab.jsx` + `HandoverNoteDetailPage.jsx` read `GET /api/doctors/handovers` (filtered by patient HIN, single `handover_notes` block). "Add new handover note" is a navigable preview that toasts + does not persist. **Held:** create wiring, pending the 8-field vs single-string decision (BACKEND_ISSUES.md A #1). |
| 5 | refer-out | ✅ **wired** — `queries/Hospital/doctor/referOut.js` + `Appointments_Dashboard/components/ReferOutModal.jsx` (SearchableSelect hospital picker off `DoctorAppContext.hospitals`, sends `hospital.sqid` + appointment `sqid` + reason); both "Refer Out" popover items in `AppointmentsList.jsx` open it. Own-hospital filtered out client-side; server errors surfaced via `extractApiErrorMessage`. Green-path 201 not yet exercised against staging. |

---

## TL;DR — all 5 backend-verified. Remaining work is frontend: wire handover, build the Refer Out UI, and resolve the handover notes-shape question.

| # | Handoff claim | Status | Note |
|---|---|---|---|
| 1 | `staff_id` optional on vitals request | ✅ **fixed** | but keep the **existing** URL `/api/doctors/vital-signs/request` — the handoff's `/api/medical-records/vital-signs/request` returns 404 |
| 2 | discharge `admission` accepts `sqid` | ✅ **fixed** | schema + live both confirm |
| 3 | discharge required fields ↔ schema | ✅ **fixed** | ⚠️ endpoint is **multipart/form-data only** — JSON → HTTP 415 — despite the schema saying `application/json` |
| 4 | Doctor↔Doctor handover endpoints | ✅ **live + ID blocker fixed** (2026-08-31) | body is `{to_doctor_id (sqid), patient_hin, handover_notes}`, all 3 required, JSON ok. ⚠️ green-path create not run; schema `201` echoes the create body, handoff said `{"detail":...}` — tolerate both. See BACKEND_ISSUES.md A |
| 5 | Refer-Out endpoint | ✅ **live + ID blocker fixed** (2026-08-31) | body `{appointment_id (sqid), hospital_to_id (hospital sqid), reason}`. Errors: bad hospital → `404 "No HospitalProfile matches"`; same hospital → `400 {"hospital_to_id":["Cannot refer to the same hospital."]}`; bad appt → `404 "No Appointment matches"` (appt checked before hospital). ⚠️ green-path not run; schema `201` echoes `{appointment_id,hospital_to_id,reason}` with **no `referral_sqid`** vs handoff's `referral_sqid` claim |

---

## 1. Vitals `staff_id` — FIXED (mind the path)

- `POST /api/medical-records/vital-signs/request` → **404** (route doesn't exist; not in schema). The handoff named the wrong path.
- The real path is unchanged: **`POST /api/doctors/vital-signs/request`**.
- Live, no `staff_id`:
  ```
  POST /api/doctors/vital-signs/request   {"patient_hin":"<real hin>","note":"..."}
  -> no "staff_id is required" error   (only complains if patient_hin is bad)
  ```
- Schema `VitalSignsRequest.required` no longer lists `staff_id`. `patient_hin`
  **is still required** — the note/general request still needs a patient.

**FE action:** in `RequestVitalsModal.jsx`, make the nurse picker optional; when
none is chosen omit `staff_id` (or send `null`); keep the current endpoint URL.

## 2. Discharge `admission` accepts `sqid` — FIXED

- Schema: `DischargeFormMultipartRequest.admission` → `type: string`,
  `description: "Admission SQID"`.
- Live: `admission=CebyjGw` no longer returns
  `"Incorrect type. Expected pk value, received str."` — the sqid is accepted.

## 3. Discharge required fields ↔ schema — FIXED, with a content-type caveat

- Schema `DischargeFormMultipartRequest.required` now lists **all 8**:
  `admission, care_instructions, chief_complaint, condition_on_discharge,
  diagnosis, drug_records, follow_up_appointment, treatment_plan`.
  `follow_up_appointment` is `nullable: true` (send the object or `null`).
- ⚠️ **The endpoint only accepts `multipart/form-data`.** `Content-Type:
  application/json` → **HTTP 415 "Unsupported media type"** (tested twice). The
  OpenAPI `requestBody` for this path still advertises only `application/json`,
  which is misleading — tell backend to fix that. In the multipart body the
  array/object fields (`diagnosis`, `treatment_plan`, `care_instructions`,
  `drug_records`, `follow_up_appointment`) must be **JSON-encoded strings**
  (the serializer has a "parse JSON strings in multipart" mixin).

**FE action:** build the discharge submit as `FormData`, `JSON.stringify` the
list/object fields, always include `follow_up_appointment` (object or `null`),
send `admission` as the admission sqid string.

## 4. Doctor↔Doctor Handover — LIVE, ID blocker FIXED (re-verified 2026-08-31)

- `POST /api/doctors/handover` — body `DoctorHandoverCreate`:
  `to_doctor_id` (string, **doctor sqid**), `patient_hin` (string, patient HIN —
  **renamed from `patient_id`; the old key is gone from the schema**),
  `handover_notes` (string). **All three required.** `application/json` works
  (also form-urlencoded / multipart per schema).
  - empty body → `400 {"to_doctor_id":["required"],"patient_hin":["required"],"handover_notes":["required"]}`
  - old key `patient_id` → `400 {"patient_hin":["This field is required."]}`
  - bogus `to_doctor_id` → `404 "No HospitalStaffProfile matches"`; real
    `to_doctor_id` sqid + bogus `patient_hin` → `404 "No PatientProfile matches"`
    (so `to_doctor_id` is validated first)
- Doctor `sqid` now on **both** `/api/receptionists/staff/doctor` (bare array)
  and `/api/hospitals/team-members?role=doctor` (paginated). `SelectHandoverDoctorModal.jsx`
  can keep its current call; just read `.sqid`.
- `GET /api/doctors/handovers?page=&size=` → **200**, paginated
  `{count, next, previous, results:[]}` (empty). Item (`DoctorHandoverRead`):
  `sqid`, `from_doctor_info`, `to_doctor_info` (`HospitalStaffBasicInfo`:
  `staff_id, firstname, lastname, role, specialization`), `patient_info`
  (`PatientBasicInfo`: `hin, firstname, lastname, gender, dob`), `handover_notes`,
  `created_at`. One combined sent+received list — FE filters by self.
- ⚠️ Didn't run a real create (transfers patient responsibility). Schema `201`
  echoes `DoctorHandoverCreate`; handoff said `{"detail":"Handover created
  successfully."}`. FE tolerates both.
- ⚠️ **Notes-shape gap:** API stores/returns one `handover_notes` string; the FE
  mockup (`AddHandoverNoteForm.jsx` etc.) has 8 structured fields.
  `POST /api/nurses/in-patient-handover` (`NurseHandover`) already models 7
  structured fields — ask backend to do the same for `DoctorHandover`. See
  BACKEND_ISSUES.md A #1.

**FE status (done):** `queries/Hospital/doctor/handover.js` added
(`fetchDoctorHandovers`, `createDoctorHandover`). `SelectHandoverDoctorModal.jsx`
keys on `doctor.sqid`. `PatientHandoverTab.jsx` reads `GET /api/doctors/handovers`
and filters `results` by `patient_info.hin`; `HandoverNoteDetailPage.jsx` renders
the single `handover_notes` string.
**FE held:** `AddHandoverNoteForm.jsx` submit — its 8 structured fields have no
home in the current one-string contract, so on upload it toasts "not available
yet" and doesn't call `createDoctorHandover`. Unblocks once BACKEND_ISSUES.md A #1
is answered.

## 5. Refer-Out — LIVE, ID blocker FIXED (re-verified 2026-08-31)

- `POST /api/doctors/refer-out` — body `ReferOut`: `appointment_id` (string,
  **appointment sqid**), `hospital_to_id` (string, **hospital sqid**), `reason`
  (string). **All three required.**
- ✅ **`hospital_to_id` now accepts the hospital `sqid`.** With a real
  appointment sqid + `hospital_to_id` = the appointment's own hospital sqid
  (`UzlON5g`) → `400 {"hospital_to_id":["Cannot refer to the same hospital."]}`
  — i.e. the sqid resolved to a `HospitalProfile`, then hit the business rule.
- Hospital `hin` (`0234022776486`) or junk → still `404 "No HospitalProfile
  matches the given query."` — **sqid only.**
- bogus `appointment_id` → `404 "No Appointment matches the given query."`
  regardless of hospital id → **appointment is validated before hospital.**
- Hospital `sqid` is on `/api/hospitals/hospitals` list items **and** on the
  `hospital_info` block embedded in `/api/appointments/staff` rows. Appointment
  rows carry both `id` (int) and `sqid` — send the `sqid`.
- ⚠️ Didn't run a real create (creates a referral). Schema `201` echoes
  `ReferOut` `{appointment_id, hospital_to_id, reason}` — **no `referral_sqid`**,
  contradicting the handoff's `{"detail":"Referral created successfully.",
  "referral_sqid":"..."}`. "Appointment isn't yours" error string uncaptured
  (test appointment belonged to the test doctor).

**FE status (done):** `queries/Hospital/doctor/referOut.js` +
`Appointments_Dashboard/components/ReferOutModal.jsx`. The modal uses
`SearchableSelect` over `DoctorAppContext.hospitals` (already
`api/hospitals/hospitals?size=100`), sends `hospital.sqid` as `hospital_to_id`,
`appointment.sqid` as `appointment_id`, and a required `reason`. The
appointment's own hospital (`appointment.hospital_info.sqid`) is filtered out of
the options; the server "Cannot refer to the same hospital." / "No HospitalProfile
matches" / "No Appointment matches" responses still surface via
`extractApiErrorMessage`. Both "Refer Out" popover entries in
`AppointmentsList.jsx` open it. On success it invalidates `["doctor-appointments"]`.
Not yet run against a real green-path create.

---

## Not in the handoff but confirmed while testing

- `/api/medical-records/discharge` `requestBody` content-type in the schema is
  wrong (says JSON, server wants multipart) — see item 3.
- Handoff's vitals endpoint path is wrong — see item 1.

## Still open (unchanged, no FE action) — Issue 1.4

Progress-notes schema still doesn't mark `subjective/objective/assessments/plan`
required; FE already enforces all four. Fine as-is.

---

## Round 4 (2026-09-01) — `transfer_sqid_discharge_fixes.md`

Verified live with the doctor JWT. Doctor-dashboard-relevant items:

| Handoff item | Result |
|---|---|
| 1. `POST /api/doctors/admissions/transfer` accepts SQIDs | ✅ **fixed.** `{admission, new_ward, new_bed}` all as sqids → `200 {"detail":"Patient transferred to Test ward successfully."}`. `TransferToAnotherWard.jsx` already sent this shape; tweaked `onSuccess` to surface `res.detail`. **BACKEND_ISSUES.md item 1 (the blocker) is closed.** (Test moved admission `CebyjGw` / Glory Kotin from `emergency` → `Test` ward on staging.) |
| 4. `?status=inpatient_discharge` now returns `ward_info` / `bed_info` | ✅ confirmed — row is `{sqid, patient_info, discharged_by, discharge_date, ward_info {sqid,name}, bed_info {bed_number,status,sqid}}`. The `DischargedPatientsTab` card rows (made conditional in the audit) now populate. No `staff_info` on these rows (only `discharged_by`), so that row stays hidden — fine. |
| 5. `GET /api/appointments/staff` missing `timeframe` → 400 | ✅ confirmed — now `400 {"timeframe":"This query parameter is required."}` (was 500). FE always sends `timeframe`; no FE change. |
| 6. `payment_provider` now populated on `patient/info` | ✅ confirmed — `{"type":"private","provider":null,"member_id":null,"updated_at":"..."}`. Doctor cards already render `patient_info.payment_provider.type` (AdvanceCheckUp, TabDetails ×4, PatientInfo) behind `?.` guards, so the badge now shows with no FE change. |

Not doctor-dashboard (nurse-side, doctor FE doesn't call them): item 2
(`/api/inpatients/patients/{hin}/task-occurrences` URL change) and item 3
(`/api/medical-records/discharge-form/{hin}` 500 fix — doctor uses
`/api/doctors/admissions/{sqid}/discharge-form` + `/api/medical-records/discharge`).

**BACKEND_ISSUES.md is now down to one open item:** no doctor-side seizure
endpoint / task type.

---

## Round 5 (2026-09-02) — `seizure_event_task_fe_handoff.md`

Only Section 1 (`seizure_event` task type) touches the doctor dashboard; §2
(task-occurrences URL), §3 (care-plan `sqid`/`created_at`), §4 (admission-note
choices), §5 (`mark-completed`) are all endpoints the doctor FE never calls
(verified by grep).

`seizure_event` was **not on staging on the first check** (`400 "not a valid
choice"`), then **deployed and verified the same day**:

`POST /api/inpatients/admissions/<sqid>/tasks`
```json
{ "task_type": "seizure_event", "start_time": "…", "frequency": "prn",
  "repeat_until": "discharge", "priority": "medium",
  "config": { "characteristics": "tonic_clonic", "emergency_standing_order": "none" } }
```
→ `201` (tasks `qFx4GC7`, `1uBuJ1Q` on admission `so6QWET`).

Contract (live):
- `config.characteristics` — required, `tonic | clonic | tonic_clonic | atonic` (`absence` → 400)
- `config.emergency_standing_order` — required, `none | administer_supplemental_o2 | iv_diazepam | iv_midazolam | pr_diazepam_suppository | iv_magnesium_sulfate_4g`
- `frequency` required; `duration {value,rate}` required only when `repeat_until` is duration-based, so `repeat_until: "discharge"` needs none
- `prn` + discharge task returns `occurrences: []` (as-needed, nothing scheduled)

**FE — DONE:** `SeizureEventModal.jsx` rewritten (was an unwired stub) — `useMutation → createInpatientTask`, `task_type: "seizure_event"`, `topSection` of two selects (`characteristics`, `emergency_standing_order`), `defaultFrequency="prn"`, `defaultRepeatUntil="discharge"`, same pattern as `GlucoseMonitoringModal` / `IVFluidModal`. `OtherMedicalServicesFab` now passes `admissionSqid` to it and marks the `seizure` item `admissionOnly: true`. `vite build` passes; exact FE payload green-path verified live.

**BACKEND_ISSUES.md now has no open items.**

---

## Round 6 (2026-09-02) — `IN_PATIENT_DISCHARGE_HANDOFF.md`

Only the **doctor in-patient discharge** part touches this dashboard (the nurse
`nurse_in_patient_discharge` task execute is nurse-side).

**Endpoint changed** — the doctor in-patient discharge now goes to
`POST /api/inpatients/admissions/<admission_sqid>/doc-discharge-form` (JSON).
The old `POST /api/medical-records/discharge` (multipart) is still live but no
longer the doctor flow; the endpoints the handoff names as "old"
(`/api/doctors/admissions/<sqid>/discharge-form(s)`) are `404` — never existed
here.

Contract (verified live, green-path `201 {"detail": "Doctor Discharge form
created for in-patient successfully."}` on admissions `so6QWET`, `Rij1BpD`,
`16SfVU0`):

- Required: `patient` (HIN), `primary_diagnosis`, `secondary_diagnosis`,
  `comorbidities`, `hospital_course_note`, `will_continue_followup` (bool),
  `follow_up_clinic`, `follow_up_date` (`YYYY-MM-DD`), `follow_up_time` (`HH:MM`
  accepted), `follow_up_instructions`.
- `follow_up_*` stay required even when `will_continue_followup` is `false`.
- Optional: `completed_investigations` / `pending_investigations`
  (`[{sqid, type: "lab_test_order"}]` — `type` is enum-checked, `"scan"` → 400),
  `discharge_medications` (`[{name, route, quantity, frequency:{value,rate},
  duration:{value,rate}, allergies:[], unit}]` — accepted live).
- Repeat discharge → `400 {"doctor": ["Doctor has already discharged this
  patient"]}`.
- Side effect: raises a `nurse_in_patient_discharge` task; the patient is not
  actually discharged / bed not freed until a nurse executes it.

**FE — DONE (option a: every endpoint-required field is required in the form):**
- `discharge.js` — `createInpatientDischarge` (old multipart) replaced with
  `createDoctorInpatientDischarge({ admissionSqid, ...body })` → the new endpoint.
- `InpatientDischargeSummary.jsx` — `buildDischargePayload()` emits the new JSON
  shape straight from `formData` (no more `diagnosis[]` collapse / multipart /
  `follow_up_appointment` object); `handleValidateAndConfirm` now requires
  primary/secondary diagnosis, comorbidities, hospital course note, and all four
  follow-up fields; investigation options carry the lab-order item `sqid` as
  their value and map to `{sqid, type: "lab_test_order"}`; success modal copy
  now says a nurse will complete the discharge.
- `DischargeFollowUpStep.jsx` — always shows the "Follow-up clinic" field (was
  swapped for a `referral` HIN input when "will continue here" was unchecked);
  the `will_continue_followup` checkbox stays.
- Exact FE payload green-path verified live. `vite build` passes.

**Update (2026-09-02, same day):** backend added `chief_complaint`,
`treatment_plan`, `care_instructions` to `doc-discharge-form` as **required
plain strings** (arrays rejected: "Not a valid string."). FE now sends and
requires all three (they were already collected in the wizard). Green-path
re-verified (admission `9y35KUw`). `condition_at_discharge` was **not** added —
still collected in the UI (step 2) and silently dropped; open question for the
backend on whether it belongs on the discharge record.

**BACKEND_ISSUES.md still has no open items** (condition_at_discharge is a
minor open question, not a blocker).

---

## Round 7 (2026-09-03) — `IN_PATIENT_DISCHARGE_HANDOFF (3).md` + fresh-discharge re-test

Backend reported the discharge flow was fine on their end and no
`DoctorDischargeForm` row was being created. Re-tested with a **fresh** doctor
discharge (admission `jahMRJt`, Glory Kotin, HIN `2078622761625`, admitted the
same day, no prior nurse task). Backend is right — the earlier "broken" readings
were all against admissions discharged on an older build.

| Item | Result |
|---|---|
| `POST .../doc-discharge-form` green-path | ✅ `201 {"detail": "Doctor Discharge form created for in-patient successfully."}`. Body: the 14 required fields (see below). |
| `condition_at_discharge` | ✅ **now a required free-string field** (no enum). Sent `"improved"`, persisted, echoed on `doctor_discharge_form.condition_at_discharge`. The old "not on the serializer" probe was unsound (bogus value on a free string passes validation → lands on the duplicate guard, same as an ignored unknown field). No FE change — already sent lowercased. |
| `GET /api/inpatients/discharged-patients` | ✅ **works.** Immediately after the create it returned `count: 1` → `jahMRJt` with full `doctor_discharge_form` (sqid `Sn1aqvp`), `nurse_discharge_form: null`, bed still `occupied`. Inclusion rule = "a doctor discharge form is linked to the admission" (not "nurse step done"), matching `GETTING-IN-PATIENT-DISCHARGE.md` edge case 1. |
| `awaiting_nurse_discharge` status | ✅ after the discharge the row in `hospitals/patients?status=inpatient` reads `status: "awaiting_nurse_discharge"` (was `active`) and **stays in the list**. `?status=awaiting_nurse_discharge` as a filter → `400`. FE can key the "awaiting nurse" badge + disable re-discharge off `row.status`. |
| nurse task raised | ✅ `nurse_in_patient_discharge` `6Ca2yje`, `status: pending`, `scheduled_for` == form `created_at`. |
| duplicate guard | ✅ re-POST → `400 {"doctor": ["Doctor has already discharged this patient"]}` (array). |
| `GET /api/raw` schema 500 (`SEIZURE_EVENT`) | ✅ **fixed** — generates (HTTP 200, ~610 KB). |
| `GET /api/inpatients/task-occurrences` (handoff walkthrough) | ⚠️ `403` for a doctor JWT — nurse queue. Doctor uses per-admission `GET /api/inpatients/admissions/<sqid>/task-occurrences`. |

**14 required fields** (schema `DoctorInpatientDischargeForm` + live): `patient`,
`chief_complaint`, `primary_diagnosis`, `secondary_diagnosis`, `comorbidities`,
`treatment_plan`, `hospital_course_note`, `care_instructions`,
`condition_at_discharge`, `will_continue_followup`, `follow_up_clinic`,
`follow_up_date`, `follow_up_time`, `follow_up_instructions`. `follow_up_time`
stored/returned as `HH:MM:SS`. Optional: `completed_investigations` /
`pending_investigations` (`[{sqid, type: "lab_test_order"}]`),
`discharge_medications`.

**Remaining (backend, data not code):** admissions discharged on the older build
(`so6QWET`, `Rij1BpD`, `16SfVU0`, `9y35KUw`, `xaNLSQu`, `HpDVyEQ`, `ZVWQzSY`,
`CebyjGw`, …) have an orphan `nurse_in_patient_discharge` task and **no** linked
`DoctorDischargeForm` — they trip the duplicate guard (so can't be re-discharged)
and never show in `discharged-patients` (even `ZVWQzSY`, whose nurse task is
completed). Backfill the form rows or clear the orphan tasks/guard, or treat them
as spent QA data.

**Still to confirm (needs a nurse execute on staging):** once a fresh admission
goes doctor → nurse full cycle and flips to `status: discharged`, does it stay in
`discharged-patients` with `nurse_discharge_form` populated?

**FE.** `discharge.js` header comment updated (drop the "silently dropped" caveat,
list `condition_at_discharge` as required). `awaiting_nurse_discharge` now drives
a badge + disabled re-discharge button in `TabDetails.jsx` (Admitted Patients
card), `Hospital_Doctors_Patients_Dashboard.jsx` (detail action bar) and
`AdvanceCheckUp.jsx` (detail header). Doctor-facing discharge summary view built:
`fetchInpatientDischargeSummary` (pages `discharged-patients`, matches
`admission_sqid` client-side — no per-admission route / working filter) +
`DoctorDischargeSummaryView.jsx` (doctor block + nurse block or "awaiting nurse"
panel + "no summary recorded" empty state), wired into the discharged-patient
"View discharge summary" button. `vite build` passes.
BACKEND_ISSUES.md item 2 closed; item 1 reframed as the data-cleanup note above.

**Backend asks surfaced by the summary view:** (1) add `will_continue_followup`,
`completed_/pending_investigations`, `discharge_medications` to
`DoctorDischargeFormRead` (accepted on POST, not returned on read); (2) a staging
record with a completed `nurse_discharge_form` is needed to verify that branch.

**Test data left on staging:** discharge form `Sn1aqvp` + nurse task `6Ca2yje` on
admission `jahMRJt`.

**BACKEND_ISSUES.md has no open blockers.**
