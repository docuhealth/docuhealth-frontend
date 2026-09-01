# Frontend Handoff — Admission Note, Seizure Log & Fluid Balance (Nurse Side)

## Summary

The backend added the nurse-side admission paperwork and observation features for inpatients: a nurse must now create an **admission note** (initial vital signs + optional intake/output + assessments) for every newly admitted patient, can record **seizure events** on the spot, and can read the patient's **fluid balance for today**. Building the admission note is **mandatory before task work**: claim, execute, and confirm-medication on that patient's tasks are now rejected server-side with a clear message until the note exists. Vital signs gained three new fields (`pain_score`, `notes`, and `spo2` now an integer 0–100) plus a computed `bmi`, so any vitals form/read view needs minor updates. All new endpoints are nurse-only, live under `/api/inpatients/admissions/<sqid>/...` (no trailing slashes), and are documented on Swagger at `/`.

---

## 1. New — Create admission note: `POST /api/inpatients/admissions/<sqid>/admission-note`

One note per admission, created by the first nurse to do the admission assessment. Everything submitted is saved together — if any part fails, nothing is saved and the nurse can retry as-is.

**Request body** (all fields optional except `vital_signs`):

```json
{
  "vital_signs": { "blood_pressure": "120/80", "temp": 36.5, "resp_rate": 16,
                   "heart_rate": 72, "spo2": 98, "height": 170, "weight": 70,
                   "pain_score": 3, "notes": "calm, resting" },
  "intake":  { "source": "...", "fluid_feed": "...", "route": "...",
               "volume_ml": 240, "recorded_at": "2026-08-26T08:30:00Z" },
  "output":  { "output_type": "...", "characteristics": "...|null",
               "volume_ml": 150, "recorded_at": "2026-08-26T08:30:00Z",
               "nursing_remark": "optional text" },
  "allergies": ["Penicillin", "Latex"],
  "mobility_assessment": "fully_mobile",
  "nutritional_assessment": "well_nourished",
  "fall_risk_assessment": "free text",
  "skin_assessment": "free text",
  "initial_nursing_concern": "free text"
}
```

Rules:

- `vital_signs` is required and works exactly like the executing-vitals form: at least one measurement value required (blood_pressure, temp, resp_rate, height, weight, heart_rate, spo2).
- `intake` and `output` are optional — the nurse can skip a section entirely; only submit a section the patient actually had. Omitted sections simply don't exist (no empty records are created).
- The intake/output object shapes are the **same** as the task-execution intake/output forms (`characteristics` is conditional per output type; pull the per-type lists from Swagger).
- `mobility_assessment`: `fully_mobile | assisted_ambulation | bedridden_immobile`
- `nutritional_assessment`: `well_nourished | at_risk_of_malnutrition | severely_malnourished`
- `allergies`: plain list of strings (defaults to `[]` when omitted).
- Never send patient/hospital/nurse IDs — they come from the admission and the logged-in nurse automatically.

**201 response** — the saved note, including display labels and linked records:

```json
{
  "sqid": "AbC1234", "created_at": "2026-08-26T08:35:00Z",
  "mobility_assessment": "fully_mobile", "mobility_assessment_label": "Fully mobile",
  "nutritional_assessment": null, "nutritional_assessment_label": null,
  "fall_risk_assessment": "...", "skin_assessment": "...",
  "allergies": ["Penicillin", "Latex"], "initial_nursing_concern": "...",
  "patient_info": { "...patient basics..." }, "staff_info": { "...nurse basics..." },
  "vital_signs_info": { "blood_pressure": "120/80", "temp": 36.5, "resp_rate": 16,
                        "heart_rate": 72, "height": 170, "weight": 70, "spo2": 98,
                        "pain_score": 3, "notes": "...", "bmi": 24.2 },
  "intake_info": { "...the saved intake record, or null..." },
  "output_info": { "...the saved output record, or null..." }
}
```

- Choice fields come back as the raw value **plus** a `<field>_label` with the display text (labels are `null` when the field is `null`).
- `vital_signs_info` / `intake_info` / `output_info` are `null` when that part wasn't saved (e.g. intake omitted → `intake_info: null`).

**Errors:** wrong/other-hospital sqid → 404; duplicate note for the same admission → 400 "This admission already has an admission note."; discharged/cancelled admission → 400; missing `vital_signs` → 400. Frontend guidance: this screen can be re-entered for any admission that answers "no note yet" — there is no separate "does a note exist?" endpoint, so track it from the create response.

## 2. New — Read fluid balance for today: `GET /api/inpatients/admissions/<sqid>/fluid-balance`

One GET, no body, used to show a "today's fluid balance" tile on the patient's chart:

```json
{ "total_intake": 2400.0, "total_output": 1700.0, "fluid_balance": 700.0 }
```

- All values are millilitres; `fluid_balance = total_intake - total_output` (positive = more in than out).
- **The window is the current UTC calendar day** (midnight UTC → now). At UTC midnight the numbers reset to 0 and grow through the day — records from yesterday never count. Keep the label honest ("Today").
- Includes intake/output from both the admission note and task execution automatically — nothing extra to do.

## 3. New — Record a seizure event: `POST /api/inpatients/admissions/<sqid>/seizure-events`

A single quick form for logging a seizure during the admission. **Only the duration is required** — everything else is optional, so the nurse can log fast.

**Request body:**

```json
{
  "motor_movement": "tonic",                       // optional dropdown
  "physical_signs": "frothing",                    // optional dropdown
  "body_parts_involved": "generalized",            // optional dropdown
  "level_of_consciousness": "did_not_regain",      // optional dropdown
  "patient_reaction": "somnolent",                 // optional dropdown
  "interventions_administered": "free text",       // optional
  "duration_minutes": 5,                           // optional, >= 0
  "duration_seconds": 30                           // optional, 0-59
}
```

Dropdown values (verbatim):

| Field | Values |
|---|---|
| `motor_movement` | `tonic` (Tonic - Stiffening), `clonic` (Clonic - Jerking), `tonic_clonic` (Tonic-Clonic), `atonic` (Atonic - Limp), `absence` (Absence) |
| `physical_signs` | `frothing` (Frothing/Foaming), `tongue_biting` (Tongue Biting), `eye_rolling` (Eye rolling), `incontinence` (Incontinence) |
| `body_parts_involved` | `generalized` (Generalized - whole body), `left_side_only`, `right_side_only`, `left_arm`, `right_arm`, `left_leg`, `right_leg` |
| `level_of_consciousness` | `preserved_alert` (Preserved / Alert), `impaired_confused` (Impaired/Confused), `completely_unconscious` (Completely unconscious), `did_not_regain` (Unresponsive after seizure - did not regain consciousness) |
| `patient_reaction` | `somnolent` (Somnolent - Sleepy/Lethargic), `confused_agitated` (Confused/Agitated), `temporarily_weak_paralyzed` (Temporarily Weak/Paralyzed), `awake_alert` (Awake and Alert) |

Duration rules (the only required data):

- At least one of `duration_minutes` / `duration_seconds` must be sent; valid entries are minutes-only, seconds-only, or both.
- Combined total must be **greater than zero** — both missing or both zero → 400 with `{"detail": "The seizure duration must be longer than zero."}`.
- Ranges are enforced per field: minutes ≥ 0, seconds 0–59.

**201 response** — the saved log with labels and the computed flag:

```json
{
  "sqid": "XyZ9876", "created_at": "2026-08-26T09:05:00Z",
  "duration_minutes": 5, "duration_seconds": 30,
  "motor_movement": "tonic", "motor_movement_label": "Tonic (Stiffening)",
  "physical_signs": null, "physical_signs_label": null,
  "body_parts_involved": null, "body_parts_involved_label": null,
  "level_of_consciousness": null, "level_of_consciousness_label": null,
  "patient_reaction": null, "patient_reaction_label": null,
  "interventions_administered": "...",
  "is_prolonged_or_critical": true,
  "patient_info": { "...patient basics..." },
  "staff_info": { "...nurse basics..." }
}
```

- `is_prolonged_or_critical` is **computed by the system, never a form field**: `true` when the seizure lasted more than 5 minutes total **or** `level_of_consciousness` is `did_not_regain`. Highlight it as an alert/badge.
- Recording a seizure never creates a task or scheduled work — nothing to poll.

## 4. Changed — Vital signs now carry `pain_score`, `notes`, integer `spo2`, and computed `bmi`

Affects **everywhere vital signs appear**: the admission-note form above, task-execution vitals forms, nursing-assessment vitals payloads, and any read view that renders vitals values.

- **New `pain_score`** — integer 0–10, display in three bands: 0 = "No pain", 1–3 = "Mild", 4–6 = "Moderate", 7–10 = "Severe". Valid on admission notes and general vitals recordings; in **task execution** it is accepted **only when the doctor's task selected it** (the queue item's `summary.parameters` lists it) — otherwise the request is rejected.
- **New `notes`** — free text tied to that vitals recording. Readable everywhere; **never accepted in task-execution payloads**.
- **`spo2` is now an integer 0–100** — it used to accept fractions; sending `98.5` or `101` is now rejected. Range-check the input (0–100, whole numbers).
- **New read-only `bmi`** — computed from that record's own `height`/`weight` (kg/cm, one decimal, `null` when height/weight missing or invalid). Never send it.
- These are **additive** on read shapes — existing frontend code that ignores the new keys keeps working.

## 5. Changed — Task actions now require the admission note first

`POST /api/inpatients/task-occurrences/<sqid>/claim`, **`/execute`**, and **`/confirm-medication`** now return **400** with:

```json
{ "detail": ["Complete this patient's admission note before working on their tasks."] }
```

until the admission has an admission note. This is enforced server-side even if your UI hides nothing. Show `detail[0]` directly to the user.

- **Do:** show this message as-is when it appears; point the nurse to the admission-note form for that patient.
- **Do:** render the task queue normally (tasks stay visible) — only the three actions are blocked.
- **Don't change:** `/release`, `/mark-missed`, and `/escalate` are **not** gated — they keep working with no note.

## 6. Not affected (no frontend action)

- No endpoints were removed; nothing existing was renamed.
- Task creation, the pharmacy flow, and the lab flow are untouched.
- The queue endpoint (`GET /api/inpatients/task-occurrences`) response is unchanged.
- Existing read shapes outside this flow (drug-order details, nursing assessments, patient vitals history) are unchanged — no fields renamed or removed.
- Vital-sign values you already send (e.g. `spo2: 98` as a whole number) behave as before.

## Implementation order / dependencies

1. **Admission note form first** — it is a prerequisite (section 5) for claim/execute/confirm; nurses are blocked from task work until it exists, so the note screen must ship with or before the task-queue integration.
2. Reuse the existing vitals form component for `vital_signs` (add the two new fields + range-checked spo2); reuse task-execution intake/output form fields for `intake`/`output`.
3. Wire the three task-action error paths to surface the gate message (section 5).
4. Fluid-balance tile and seizure form are independent — drop them in whenever.