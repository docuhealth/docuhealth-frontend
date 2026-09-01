# Frontend Handoff — Inpatient Task Execution (Nurse Side)

## Summary

The backend now has a complete nurse-side workflow for executing inpatient care tasks. A new "task queue" endpoint lists pending task occurrences for the nurse's hospital, and seven new action endpoints let a nurse **claim** a task, **release** it back, **mark it missed**, **escalate** it, and then **complete** it either by submitting a short form (vitals, procedure, IV fluid, glucose, intake/output) or by a one-tap **confirm** (medication). The frontend needs to build this task-queue screen plus its action buttons and small per-task-type forms. All endpoints are nurse-only (JWT of a user whose staff role is nurse); everything is under `/api/inpatients` and documented live on Swagger at `/`.

---

## 1. The flow you're implementing

Every task occurrence moves through statuses the backend owns:

```
pending ──claim──> in_progress ──execute / confirm-medication──> completed
   │ ▲                  │  ▲              └── mark-missed ──> missed
   │ └───── release ────┘  │
   └── mark-missed ──> missed          any pending/in_progress ──escalate──> escalated
discharged patient's occurrences are cancelled (untouchable)
```

Rules the UI must respect:

- **Only the nurse who claimed a task can act on it** once it's `in_progress` (the backend enforces this even against hand-crafted requests — expect 400).
- If two nurses claim at the same moment, **only the first wins**; the second gets a 400. Show that error as "someone else already claimed this".
- **Overdue ≠ missed.** An overdue task stays fully actionable — never auto-hide or disable actions just because it's late. Nothing is ever marked missed automatically.
- **Terminal states (`completed`, `missed`, `escalated`, `cancelled`) are final.** No undo/reopen/edit — hide all actions for them.
- Claimed tasks disappear from the queue automatically (the list only returns `pending`). To show a nurse "my active task", keep the response from `/claim` locally or refetch by sqid.

## 2. New endpoints (all `POST` unless noted, all nurse-only)

| # | Method + path | Purpose |
|---|---|---|
| 1 | `GET /api/inpatients/task-occurrences` | The nurse's pending-task queue |
| 2 | `POST /api/inpatients/task-occurrences/<sqid>/claim` | Take ownership (pending → in_progress) |
| 3 | `POST /api/inpatients/task-occurrences/<sqid>/release` | Give it back (in_progress → pending) |
| 4 | `POST /api/inpatients/task-occurrences/<sqid>/mark-missed` | Record it wasn't done |
| 5 | `POST /api/inpatients/task-occurrences/<sqid>/escalate` | Flag it needs attention (body required) |
| 6 | `POST /api/inpatients/task-occurrences/<sqid>/execute` | Complete with a form (5 clinical types) |
| 7 | `POST /api/inpatients/task-occurrences/<sqid>/confirm-medication` | Complete a medication task (no body) |

No trailing slashes anywhere (`APPEND_SLASH=False`). `<sqid>` is the occurrence `sqid` from the queue.

### Shared behavior for endpoints 2–7

- **Wrong sqid or another hospital's occurrence → plain 404.** Just show "not found"; don't build special cases.
- **Rejection (wrong state, not owner, terminal, etc.) → 400** with body `{"detail": ["<human-readable reason>"]}`. Display `detail[0]` directly to the user.
- Non-nurse roles → 403; not logged in → 401 (standard JWT headers).
- **Endpoints 2–5, 7 return HTTP 200 with the refreshed occurrence**, so you can update the row without refetching:

```json
{
  "sqid": "AbC1234",
  "scheduled_for": "2026-08-26T09:00:00Z",
  "status": "in_progress",
  "started_by_info": { "...staff name/staff_id..." },
  "started_at": "2026-08-26T08:55:10Z",
  "escalated_by_info": null,
  "escalated_at": null,
  "escalation_reason": null,
  "completed_by_info": null,
  "completed_at": null
}
```

Fields fill in as actions happen (`completed_*` after execute/confirm, `escalated_*` after escalate).

## 3. The task queue — `GET /api/inpatients/task-occurrences`

- Paginated (default page size 10): `?page=N&size=N` → standard `{count, next, previous, results}` envelope.
- Optional filters: `?timing=upcoming|due|overdue` and `?priority=low|medium|high|urgent`. Invalid values → 400 naming the bad param.
- Returns **only `pending`** occurrences of **active admissions** at the nurse's hospital — claimed/done/cancelled items never appear here.
- Ordering is done for you: overdue first, then due, then upcoming; within those, urgent→low priority, then soonest.

Each item:

```json
{
  "sqid": "XyZ9876",
  "patient_info": { "...patient basics..." },
  "task_type": "vital_signs",
  "instructions": "Doctor's free text",
  "priority": "urgent",
  "scheduled_for": "2026-08-26T09:00:00Z",
  "timing_state": "overdue",
  "status": "pending",
  "summary": { "...see below..." }
}
```

- `task_type`: `vital_signs | procedure | medication | input_output | glucose | iv_fluid`
- `timing_state`: `upcoming | due | overdue` (derived; due = within 30 min after scheduled time)

`summary` gives the nurse what they need at a glance, keyed by `task_type`:

| task_type | summary |
|---|---|
| `procedure` | `{procedure_name}` |
| `vital_signs` | `{parameters: ["blood_pressure", "temp", ...]}` — exactly which vitals to collect |
| `medication` | `{drug_name, quantity, unit, frequency}` |
| `input_output` | `{tracking_mode: "strict_24_hour_fluid_balance"\|"intake_only"\|"output_only"}` |
| `glucose` | `{schedule: "four_point_rbs" \| "six_point_rbs" \| ... }` |
| `iv_fluid` | `{solution_type, infusion_rate}` |

## 4. Completing tasks

### Medication — `POST .../confirm-medication`

No request body. The drug details were entered by the doctor; confirming just records "given". Returns the refreshed occurrence with `status: "completed"` + `completed_by_info/completed_at`.

### Everything else — `POST .../execute` (body depends on `task_type`)

The doctor's inputs (procedure name, IV fluid plan, etc.) are carried automatically — **the nurse never re-enters them and cannot edit them**. Send only the nurse-observed fields:

**`vital_signs`**
```json
{ "blood_pressure": "120/80", "temp": 36.5, "resp_rate": 16, "heart_rate": 72, "spo2": 98, "height": 170, "weight": 70 }
```
All optional but **at least one value required**. Only submit parameters listed in the task's `summary.parameters` — others are rejected.

**`procedure`**
```json
{ "consent": "given|emergency", "post_procedure_status": "clean_dry|oozing_bleeding|leakage", "estimated_blood_volume_ml": 50, "current_position": "head_of_bed_elevated|flat_supine" }
```
Blood loss is nullable ("ml or nil").

**`iv_fluid`**
```json
{ "add_to_patient_fluid_chart": true, "site_condition": "clean|swollen_leaking|red_painful|line_blocked", "cannula_location": "left_forearm|right_forearm|left_hand|right_hand", "nursing_remark": "optional text" }
```

**`glucose`**
```json
{ "value": 7.2, "unit": "mg_dl|mmol_l", "context": "fasting|pre_meal|post_meal|bedtime|random", "insulin_administered": false }
```

**`input_output`** — one or both sections, gated by the task's `tracking_mode`:

```json
{
  "intake":  { "source": "...", "fluid_feed": "...", "route": "...", "volume_ml": 240, "recorded_at": "2026-08-26T08:30:00Z" },
  "output":  { "output_type": "...", "characteristics": "...|null", "volume_ml": 150, "recorded_at": "2026-08-26T08:30:00Z", "interval": "<frequency code>", "nursing_remark": "optional" }
}
```
- `intake_only` mode rejects an `output` section and vice versa; at least one section is required.
- `recorded_at` = when the observation actually happened (may differ from the scheduled time) — give it a datetime picker defaulting to now.
- `characteristics` is **conditional**: each output type has its own dropdown list; `stool_bowel` and `ng_gastric_suction` have **none** (must be empty/null). Full per-type lists are on Swagger (`/api/raw`) — pull them from there rather than hardcoding from this doc.
- Submitting both sections creates two chart records server-side; you still get back one refreshed occurrence.

### Execute errors & atomicity

Validation errors come back as normal DRF 400s keyed by field (e.g. `{"characteristics": ["'x' is not a valid characteristic for Urine."]}`). If anything fails mid-save, **nothing persists and the occurrence stays `in_progress`** — safe to let the nurse retry without reloading.

## 5. Escalation — `POST .../escalate`

Body: `{ "escalation_reason": "required, non-empty text" }`. It only *records* who/when/why — no notification, reassignment, or status change happens anywhere else. After escalating, the occurrence is terminal (`escalated`).

## 6. Implementation order / dependencies

1. Build the queue screen first — every other feature consumes its `sqid`s and `summary` payloads.
2. Wire claim/release next (they drive who can see which buttons).
3. Then confirm-medication (no form) and the five execute forms.
4. Missed/escalate can come last — they're independent single-purpose buttons.

## 7. Explicitly out of scope (no frontend work)

Nothing was removed; existing doctor-side task creation, pharmacy, and lab flows are unchanged. There is deliberately **no** endpoint listing completed/missed history yet, **no** editing or reopening of finished occurrences, and no automatic overdue processing. When the parent task's last actionable occurrence finishes, the backend marks the whole task completed internally — nothing for the frontend to call.
