# Admission Flow: Backend Issues (from frontend)

Context: hospital doctor + receptionist dashboards. These issues sit on the
admission-request lifecycle: a doctor requests admission from an outpatient or
check-in record, the receptionist confirms, the patient should become an active
inpatient visible to the doctor. Reported by QA on 2026-09-03 against staging
(`https://docuhealth-backend-2-4gw8.onrender.com`).

The frontend side of every call below has been checked. The FE sends the
documented shapes, applies no client-side filtering to these lists, and renders
whatever the API returns. The problems are server-side.

---

## Summary

| # | Severity | Issue |
|---|----------|-------|
| 1 | Blocker | A confirmed admission does not appear in the doctor's "Admitted Patients" tab. `GET /api/hospitals/patients?status=inpatient` returns an empty list for the doctor. Doctors are meant to see every admitted patient in the hospital, not only patients in their own ward. |
| 2 | High | After a patient is admitted, the originating outpatient / check-in record is not closed, so the patient still shows under "Out Patients". |
| 3 | High | "Request for admission" can be submitted repeatedly for the same patient. Each submit creates a new pending request on the receptionist's list. No duplicate guard. |

---

## Endpoints involved

| Call | Used by |
|------|---------|
| `POST /api/doctors/admissions/request` body `{ ward, bed, patient: <HIN>, check_in?: <check-in sqid> }` | Doctor requests admission |
| `GET /api/receptionists/admissions/requests?page=&size=` | Receptionist's Admission Requests list |
| `PATCH /api/hospitals/admissions/<admission_request_sqid>/confirm` | Receptionist confirms (admits) |
| `GET /api/hospitals/patients?status=inpatient&page=&size=6` | Doctor "Admitted Patients" tab |
| `GET /api/hospitals/patients?status=outpatient&page=&size=6` | Doctor "Out Patients" tab (also `inpatient_discharge`, `outpatient_discharge` for the other tabs) |
| `GET /api/doctors/dashboard` | Doctor profile payload |

The doctor, nurse, receptionist and admin dashboards all read the same
`GET /api/hospitals/patients?status=<status>` endpoint for their admitted,
outpatient and discharged lists. The only difference between callers is the JWT
role. Any per-role narrowing is done server-side.

---

## 1. Blocker: doctor cannot see admitted patients (inpatient list filtered per caller)

### Reproduction (QA, 2026-09-03)

1. A receptionist confirms an admission request: `PATCH /api/hospitals/admissions/<sqid>/confirm` returns success ("Patient admitted successfully").
2. The doctor (staff account "Bodunde") opens the patients dashboard, "Admitted Patients" tab.
3. Network shows `GET /api/hospitals/patients?status=inpatient&page=1&size=6` returning, with HTTP 200:

   ```json
   {"count":0,"next":null,"previous":null,"results":[]}
   ```

4. The tab renders its empty state, "No admitted patients!".

So the server returns an empty inpatient list for this doctor even though an
admission was just confirmed at this hospital. This is not a frontend cache
problem: the response body itself is empty, and the request is well formed
(`status=inpatient`, correct pagination, valid `Authorization: Bearer` header,
HTTP 200).

### Expected behaviour

Per the product / UI lead: a doctor should see every admitted patient in the
hospital, not only patients in the ward the doctor is assigned to. So
`GET /api/hospitals/patients?status=inpatient` for a doctor JWT should return the
same hospital-wide set that the receptionist and admin get.

### Why the list looks filtered per caller

- Staff onboarding requires a ward for doctors. The roles that do NOT need a ward
  are `receptionist`, `lab_scientist`, `pharmacist`. Doctor and nurse both
  require a ward. So a doctor record carries a ward on the backend.
- In an earlier live audit (2026-08-31) a different doctor account
  (`testingthisthingtoday@gmail.com`) saw multiple inpatients from the exact same
  call. "Bodunde" sees zero. Something per-account narrows the result.
- Nurses have a separate, explicitly ward-scoped admitted list
  (`GET /api/nurses/admissions`). The generic `hospitals/patients` endpoint
  should not apply that same narrowing to a doctor.

The frontend sends only `status`, `page`, `size` and an optional `search`. It
never requests a ward or doctor filter. Whatever narrowing is happening is
entirely server-side, keyed off the JWT.

### What we need

- `GET /api/hospitals/patients?status=inpatient` for a doctor JWT: return all
  active admissions for the doctor's hospital, hospital-wide, with no ward filter
  and no attending-doctor filter. Same result set the receptionist and admin see.
- Confirm the same for the other statuses the doctor tabs use: `outpatient`,
  `inpatient_discharge`, `outpatient_discharge`.
- Confirm `PATCH /api/hospitals/admissions/<sqid>/confirm` moves the admission
  into the state `?status=inpatient` selects, and that it appears immediately
  (no separate nurse bed-assignment step required for visibility).

### To help isolate it

Call `GET /api/hospitals/patients?status=inpatient` with a doctor token, a
receptionist token and an admin token right after a confirm, and compare. If the
receptionist and admin see the patient and the doctor does not, the per-caller
filter on the doctor path is the bug.

---

## 2. High: admitted outpatient still shows under "Out Patients"

### Problem

When a doctor admits an outpatient, the FE sends
`POST /api/doctors/admissions/request` with `check_in: <check-in sqid>` (the
originating outpatient / check-in record). After the receptionist confirms the
admission, that check-in is still returned by
`GET /api/hospitals/patients?status=outpatient`.

Result: the patient still appears in the doctor's "Out Patients" tab after being
admitted. The receptionist, nurse and admin already see the patient in both the
outpatient list and the inpatient list at the same time, and once issue 1 is
fixed the doctor will too. The two tabs are separate paginated calls, so the
frontend cannot dedupe them.

### What we need

- When an admission is created or confirmed from a check-in, transition or close
  that check-in so it leaves the `status=outpatient` result set.
- If there is meant to be a window where the patient is still an outpatient
  (admission requested but not yet confirmed), give the `status=outpatient` row a
  field the FE can read, for example `admission_request_status`
  (`null` | `pending` | `confirmed` | `rejected`), so the FE can label or hide it.

---

## 3. High: duplicate "Request for admission" submissions

### Problem

`POST /api/doctors/admissions/request` appears to have no guard against a second
pending request for the same patient or check-in. The doctor can open the
patient again, submit again, and each submit creates a new row in
`GET /api/receptionists/admissions/requests`. The receptionist then sees several
pending admission requests for the same patient, each with its own `sqid`.

On the frontend there is nothing to key an "already requested" state off: the
outpatient row carries no admission-request status, and the patient does not
leave the "Out Patients" list after a request (issue 2), so the "Request for
admission" button stays available.

### What we need

- Reject a second `POST /api/doctors/admissions/request` while one is still
  `pending` for the same patient / check-in, with a clear 400, for example
  `{"detail": "An admission request is already pending for this patient."}`.
- Expose the request state on the `status=outpatient` row (see the
  `admission_request_status` field proposed in issue 2) so the FE can disable the
  button and show "Admission requested" instead.

---

## Frontend behaviour, for reference

- The doctor, nurse, receptionist and admin admitted / outpatient / discharged
  lists all call `GET /api/hospitals/patients?status=<status>&page=&size=6` with
  only `status`, `page`, `size` and an optional `search`. No role or ward filter
  is sent by the client.
- `POST /api/doctors/admissions/request` is sent with `{ ward, bed, patient: <HIN> }`
  plus `check_in: <sqid>` when the admission is started from an outpatient / check-in row.
- After a successful request the FE only shows a toast and closes the modal. It
  does not re-fetch any list or mark the patient. The "Request for admission"
  button stays available on the next visit to that patient.

---

## One combined ask

Please walk the lifecycle once with a fresh patient, and at each step report the
check-in status, the admission status, and which ward / staff the admission is
attributed to:

1. `POST /api/doctors/admissions/request` (doctor A, from a check-in).
2. `GET /api/receptionists/admissions/requests` (should be exactly one pending row).
3. `POST /api/doctors/admissions/request` again for the same patient (is it rejected?).
4. `PATCH /api/hospitals/admissions/<sqid>/confirm` (receptionist).
5. `GET /api/hospitals/patients?status=inpatient` with doctor A, receptionist and admin tokens (does doctor A see the patient?).
6. `GET /api/hospitals/patients?status=outpatient` with doctor A (is the check-in still there?).
