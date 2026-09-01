# Frontend Handoff — Task Occurrence Listing & Inpatient Admission List Changes

## Summary

The task occurrence list endpoint now requires a `status` query param and supports three tabs: pending, in-progress, and history. A new patient-specific endpoint serves the patient management tab. Additionally, the hospital inpatient list response now includes staff, ward, bed, and processing info that was previously missing.

---

## 1. Task Occurrence Endpoints — Changed + New

### Changed: `GET /api/inpatients/task-occurrences` (Hospital-wide / Nurse Tasks tab)

**Breaking change:** The `status` query parameter is now **required**. Omitting it returns 400.

**New required param:**
- `status` — one of `pending`, `in_progress`, `history`

**What each status returns:**
- `pending` — All pending task occurrences in the hospital (same as before, but now explicit). No nurse scoping — every nurse sees all available tasks.
- `in_progress` — Only the **authenticated nurse's** claimed in-progress tasks. Automatically scoped to the logged-in nurse — no param needed.
- `history` — Only the **authenticated nurse's** completed, missed, escalated, or cancelled tasks. Automatically scoped.

**Optional params (unchanged):** `timing` (upcoming/due/overdue), `priority` (low/medium/high/urgent). These still work the same way — filter within the selected status group.

**Response shape:** Same as before. Each item:
```
{
  sqid, patient_info, task_type, instructions, priority,
  scheduled_for, timing_state, status, summary
}
```
`timing_state` is only populated for `status=pending` (overdue/due/upcoming). For `in_progress` and `history` it won't be meaningful.

**Frontend action:** Update any call to this endpoint to include `?status=pending|in_progress|history`. The nurse tasks tab should make three separate calls (one per tab). For the in-progress and history tabs, no nurse filter param is needed — the backend auto-scopes to the logged-in nurse.

---

### New: `GET /api/inpatients/patients/{patient_sqid}/task-occurrences` (Patient Management tab)

**Permission:** Nurse or Doctor auth required.

**Required param:** `status` — one of `pending`, `in_progress`, `history`

**What each status returns:**
- `pending` — The specific patient's pending task occurrences (active tasks on active admissions only).
- `in_progress` — The specific patient's in-progress task occurrences.
- `history` — The specific patient's completed, missed, escalated, or cancelled task occurrences (includes all terminal statuses, not scoped to a specific nurse).

**Optional params:** `timing`, `priority` — same as the hospital-wide endpoint.

**Response shape:** Same as the hospital-wide endpoint (same serializer).

**Frontend action:** Use this endpoint for the patient management view. Pass the patient's `sqid` in the URL. Make three calls (one per status tab).

**Note on `timing_state`:** This field is only meaningful for `status=pending`. For `in_progress` and `history`, it will be absent/null — don't display it in those tabs.

---

## 2. Inpatient Admission List Response — Changed

### Changed: `GET /api/hospitals/inpatients` (or wherever `HospitalInpatientSerializer` is used)

The inpatient admission list response now includes several new fields. This is an additive change — existing fields are untouched.

**New fields in each admission item:**

| Field | Type | Description |
|---|---|---|
| `staff_info` | object `{ sqid, firstname, lastname, ... }` | The doctor/admitting staff |
| `ward_info` | object `{ sqid, name }` | Assigned ward (nullable) |
| `bed_info` | object `{ sqid, bed_number, status }` | Assigned bed (nullable) |
| `processed_by_info` | object `{ sqid, firstname, lastname, ... }` | Staff who processed (approved/rejected) the admission |
| `discharge_date` | datetime or null | When the patient was discharged |
| `request_date` | datetime | When the admission was requested |
| `rejected_at` | datetime or null | When the admission was rejected |

**Frontend action:** No breaking changes. You can start displaying the new fields (`staff_info`, `ward_info`, `bed_info`, `processed_by_info`, `discharge_date`, `request_date`, `rejected_at`) when ready. The `ward_info` and `bed_info` will be `null` if no ward/bed has been assigned yet.

---

## Quick Reference — All Changed Endpoints

| Endpoint | Method | Change |
|---|---|---|
| `GET /api/inpatients/task-occurrences` | GET | **Breaking:** `status` param now required (`pending`/`in_progress`/`history`). In-progress and history auto-scope to logged-in nurse. |
| `GET /api/inpatients/patients/{sqid}/task-occurrences` | GET | **New.** Patient-specific task occurrences. Same `status` param required. |
| `GET /api/hospitals/inpatients` (or similar) | GET | **Additive.** Response now includes `staff_info`, `ward_info`, `bed_info`, `processed_by_info`, `discharge_date`, `request_date`, `rejected_at`. |
