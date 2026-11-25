# New Dashboard Endpoints - Frontend Handoff

## Part 1 - Before you start

**Method.** Every endpoint here is a `GET`. None takes a request body. Inputs go in the path or the query string.

**Auth.** Send the access token as `Authorization: Bearer <token>`. Who may call each endpoint is listed in the table below. A wrong role gets a `403`, and a missing token gets a `401`.

**Pagination.** Lists take `page` and `size` (default 10, maximum 100) and return:

```json
{ "count": 0, "next": null, "previous": null, "results": [] }
```

`next` and `previous` are full URLs, for example `https://<host>/api/patients/visits?page=2&size=3`.

**`period` / `timeframe`.** Takes `day`, `week` (Monday to Sunday) or `month`, always the current one. Leave it out for all time. Period windows are in **UTC**: `day` runs from 00:00 UTC to 00:00 UTC (01:00 to 01:00 in Lagos).

**Changes.** Counts come with one of two change fields:

- `change` is the current count minus the previous period's count.
- `percent_change` is `(current - previous) / previous x 100`, rounded to 2 places.
- Both are `null` when `period` is left out. `percent_change` is also `null` when the previous count was 0.

**Errors.**

| Status | When                                                    | Body                                                                                                                     |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `400`  | Unknown `period`, `timeframe`, `status` or `type` value | `{"<param>": "<message>"}`, e.g. `{"timeframe": "timeframe must be 'day', 'week' or 'month'."}`                          |
| `401`  | No or expired token                                     | `{"detail": "..."}`                                                                                                      |
| `403`  | Your role may not call this endpoint                    | `{"detail": "You do not have permission to perform this action."}`                                                       |
| `404`  | Unknown staff `sqid` or patient `hin` in the path       | `{"detail": "No StaffMembership matches the given query."}` / `{"detail": "No PatientProfile matches the given query."}` |

### Endpoint list

| #   | Endpoint                                           | Who can call it                                    | Query parameters                                        | Can be used on                                                      |
| --- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | `GET /api/hospital-ops/patient-management/metrics` | Hospital admin                                     | `period`                                                | Hospital Admin Patient Management (metric cards)                    |
| 2   | `GET /api/hospital-ops/patients`                   | Hospital admin or any staff member at the hospital | `status` (required), `period`, `search`, `page`, `size` | Hospital Admin Patient Management (patient lists)                   |
| 3   | `GET /api/hospital-ops/staff/<sqid>`               | Hospital admin                                     | `period`                                                | Single Staff Management                                             |
| 4   | `GET /api/hospital-ops/administration-metrics`     | Hospital admin                                     | `timeframe`                                             | Hospital Admin Dashboard                                            |
| 5   | `GET /api/hospital-ops/staff-role-counts`          | Hospital admin                                     | none                                                    | Hospital Admin Dashboard                                            |
| 6   | `GET /api/hospital-ops/operation-metrics`          | Receptionist                                       | `period`                                                | Receptionist Dashboard (metric cards)                               |
| 7   | `GET /api/hospital-ops/patients-check-ins`         | Receptionist or hospital admin                     | `search`, `page`, `size`                                | Receptionist Dashboard and Hospital Admin Dashboard (check-in list) |
| 8   | `GET /api/hospital-ops/appointments-overview`      | Receptionist                                       | `period`                                                | Appointments Dashboard (metric cards)                               |
| 9   | `GET /api/patients/visit-metrics`                  | Patient (about themselves)                         | none                                                    | Single Patient Dashboard (patient view)                             |
| 9b  | `GET /api/patients/<hin>/visit-metrics`            | Receptionist or hospital admin                     | none                                                    | Single Patient Dashboard (staff view)                               |
| 10  | `GET /api/patients/guardianship`                   | Patient (about themselves)                         | `page`, `size`                                          | Single Patient Dashboard (patient view)                             |
| 10b | `GET /api/patients/<hin>/guardianship`             | Receptionist or hospital admin                     | `page`, `size`                                          | Single Patient Dashboard (staff view)                               |
| 11  | `GET /api/patients/visits`                         | Patient (about themselves)                         | `type`, `page`, `size`                                  | Single Patient Dashboard (patient view)                             |
| 11b | `GET /api/patients/<hin>/visits`                   | Receptionist or hospital admin                     | `type`, `page`, `size`                                  | Single Patient Dashboard (staff view)                               |

Related existing endpoint: `GET /api/hospital-ops/appointments` (hospital admin or receptionist) takes `timeframe=today|tomorrow|upcoming|history`. `upcoming` means after tomorrow, so the `today`, `tomorrow` and `upcoming` tabs do not overlap. Its list can be used for the appointment lists on the Receptionist Dashboard and the Appointments Dashboard. Its rows are shaped like the `appointment` object in endpoint 11.

### What Swagger shows

Swagger (generated live) groups endpoints 1 and 3 to 8 under **Hospital Dashboards**. Endpoint 2 is under **Hospital**, **Nurse** and **Doctor**. Endpoints 9 to 11b are under **Patient**.

- **Endpoints 1 and 3 to 11b:** Swagger shows the full response schema, and it matches the examples below. One difference: Swagger types `patient_info.email` on endpoint 9b as a plain string, but it is `null` for a dependant.
- **Endpoint 2 is not in Swagger yet:** Swagger shows the `status`, `period` and `search` parameters but **"No response body"**, and it does not list `page` and `size` (both work). The row shape depends on `status`, with four different shapes, and the Swagger schema for them will be added later. Until then, use the four examples under endpoint 2 in this note.

---

## Part 2 - Endpoints

### 1. Patient management metrics

`GET /api/hospital-ops/patient-management/metrics` returns check-in metrics that can be used on the Hospital Admin Patient Management metric cards.

**Request**

```
GET /api/hospital-ops/patient-management/metrics?period=day
```

**Response `200`**

```json
{
  "total_checkins": 4,
  "new_checkins": { "count": 2, "change": 2 },
  "checkins_this_period": { "count": 3, "change": 3 },
  "returning_patients": 1
}
```

| Field                  | Meaning                                                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `total_checkins`       | Every check-in ever at your hospital. Ignores `period`.                                                                                                                                                    |
| `new_checkins`         | Check-ins in the period that were the patient's first ever at your hospital. `change` is a number difference.                                                                                              |
| `checkins_this_period` | Check-ins created in the period. `change` is a number difference.                                                                                                                                          |
| `returning_patients`   | Distinct patients with a check-in in the period that came after an earlier one at your hospital. Each patient counts once. Admitted patients are included, because every admission starts from a check-in. |

These three numbers don't add up: `new_checkins` counts check-ins, `returning_patients` counts people, and `checkins_this_period` counts every check-in.

Without `period`, the counts cover all time and both `change` values are `null`.

### 2. Patients by status

`GET /api/hospital-ops/patients` returns paginated patient lists that can be used on the Hospital Admin Patient Management lists (admitted, checked-in, checked-out, discharged).

**Request**

```
GET /api/hospital-ops/patients?status=outpatient_discharge&period=day&search=Amaka&page=1&size=10
```

| Parameter           | Values                                                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status` (required) | `inpatient`, `outpatient`, `outpatient_discharge`, `inpatient_discharge`. Anything else returns a `400`: `{"status": "status must be one of: inpatient, outpatient, inpatient_discharge, outpatient_discharge."}` |
| `period`            | Filters each list on its own date (see below)                                                                                                                                                                     |
| `search`            | Patient's first, middle or last name, or email. Not HIN or phone.                                                                                                                                                 |

| `status`               | Can be used for | Rows                                                                                  | `period` filters on          | Order                  |
| ---------------------- | --------------- | ------------------------------------------------------------------------------------- | ---------------------------- | ---------------------- |
| `inpatient`            | Admitted        | Admissions still on a ward                                                            | `created_at` (admitted on)   | Newest admission first |
| `outpatient`           | Checked-in      | Open check-ins a nurse or doctor has started. Check-ins still `pending` are left out. | `created_at` (checked in at) | Newest first           |
| `outpatient_discharge` | Checked-out     | Closed check-ins                                                                      | `closed_at` (checked out at) | Newest close first     |
| `inpatient_discharge`  | Discharged      | Discharged admissions                                                                 | `discharge_date`             | Newest discharge first |

There is no `ordering` parameter.

**Shared shapes**

`patient_info` on every row:

```json
{
  "dob": "1988-04-12",
  "gender": "female",
  "phone_num": "08031234567",
  "firstname": "Amaka",
  "lastname": "Okafor",
  "middlename": null,
  "hin": "DH12345678",
  "street": "12 Allen Avenue",
  "city": "Ikeja",
  "state": "Lagos",
  "country": "Nigeria",
  "email": "amaka@example.com",
  "contact_email": null,
  "payment_provider": {
    "type": "hmo",
    "provider": null,
    "member_id": null,
    "updated_at": "2026-11-25T10:14:08.081427Z"
  }
}
```

- `patient_info` has no patient `sqid`. Use `hin`.
- For a **dependant** (a patient with no login), the `email` key is **missing**, not `null`. Read it as `patient_info.email ?? null`.
- `payment_provider` is how the patient pays at your hospital. When it was never set it is `{"type": "private", "provider": null, "member_id": null, "updated_at": null}`.

Staff objects (`requested_by_info`, `processed_by_info`, `closed_by_info`, `discharged_by_info`):

```json
{
  "sqid": "KDN3VMb",
  "firstname": "Tunde",
  "lastname": "Bello",
  "role": "doctor",
  "specialization": null
}
```

**Response `200`, `status=inpatient`**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "njg0NQX",
      "status": "active",
      "patient_info": { "...": "patient_info as above" },
      "requested_by_info": {
        "sqid": "KDN3VMb",
        "firstname": "Tunde",
        "lastname": "Bello",
        "role": "doctor",
        "specialization": null
      },
      "ward_info": { "sqid": "K3yyGbv", "name": "Female Medical Ward" },
      "bed_info": { "bed_number": 4, "status": "occupied", "sqid": "vbCdSxb" },
      "processed_by_info": {
        "sqid": "VZtr6jz",
        "firstname": "Rita",
        "lastname": "Desk",
        "role": "receptionist",
        "specialization": null
      },
      "created_at": "2026-11-25T10:14:08.097521Z",
      "discharge_date": null,
      "latest_vitals": {
        "sqid": "06XdA5I",
        "created_at": "2026-11-25T10:14:08.081427Z",
        "blood_pressure": "120/80",
        "temp": null,
        "resp_rate": null,
        "heart_rate": 88.0,
        "height": null,
        "weight": null,
        "spo2": null,
        "pain_score": null,
        "notes": null,
        "bmi": null,
        "patient_info": { "...": "patient_info as above, with payment_provider null" },
        "staff_info": {
          "sqid": "AM8dMkr",
          "firstname": "Nora",
          "lastname": "Nurse",
          "role": "nurse",
          "specialization": null
        },
        "hospital_info": {
          "name": "Lagoon General Hospital",
          "email": "info@lagoongeneral.example.com",
          "sqid": "0UdrKQw"
        }
      },
      "ongoing_medications": [
        {
          "name": "Paracetamol",
          "route": "Oral",
          "quantity": 10.0,
          "frequency": "bd",
          "duration": { "value": 5.0, "rate": "days" },
          "allergies": [],
          "unit": null
        }
      ],
      "admission_note_info": null
    }
  ]
}
```

- `status` is `active` or `awaiting_nurse_discharge`.
- `requested_by_info` is the doctor who asked for the bed, which can be shown as "Admitted by".
- `processed_by_info` is the staff member who accepted the request.
- `created_at` is when the patient was admitted.
- `latest_vitals` and `admission_note_info` are `null` when there are none.

**Response `200`, `status=outpatient`**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "KNm960Z",
      "status": "nursing_active",
      "patient_info": { "...": "patient_info as above" },
      "created_at": "2026-11-25T10:14:08.081427Z",
      "latest_vitals": { "...": "same shape as in status=inpatient" },
      "admission_request_status": null
    }
  ]
}
```

- `created_at` is when the patient checked in.
- `status` is one of `nursing_active`, `nursing_idle`, `doctor_idle`, `doctor_active`, `doctor_seen`.
- `admission_request_status` is `pending`, `confirmed` or `rejected` when a bed was requested during the check-in, else `null`.

**Response `200`, `status=outpatient_discharge&period=day`**

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "vbVwBaG",
      "patient_info": { "...": "patient_info as above" },
      "closed_by_info": {
        "sqid": "KDN3VMb",
        "firstname": "Tunde",
        "lastname": "Bello",
        "role": "doctor",
        "specialization": null
      },
      "closed_at": "2026-11-25T10:14:08.081427Z"
    },
    {
      "sqid": "CrQKO8H",
      "patient_info": {
        "dob": "2015-06-01",
        "gender": "male",
        "phone_num": "",
        "firstname": "Chidi",
        "lastname": "Okafor",
        "middlename": null,
        "hin": "7894623012343",
        "street": null,
        "city": null,
        "state": null,
        "country": null,
        "contact_email": null,
        "payment_provider": {
          "type": "private",
          "provider": null,
          "member_id": null,
          "updated_at": null
        }
      },
      "closed_by_info": {
        "sqid": "AM8dMkr",
        "firstname": "Nora",
        "lastname": "Nurse",
        "role": "nurse",
        "specialization": null
      },
      "closed_at": "2026-11-25T10:14:08.081427Z"
    }
  ]
}
```

- `closed_by_info` (checked out by) is `null` when a scheduled job closed the check-in.
- The second row is a dependant, so `patient_info` has no `email` key.

**Response `200`, `status=inpatient_discharge`**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "E7dBsHF",
      "patient_info": { "...": "patient_info as above" },
      "status": "discharged",
      "created_at": "2026-11-25T10:14:08.097521Z",
      "discharged_by_info": {
        "sqid": "KDN3VMb",
        "firstname": "Tunde",
        "lastname": "Bello",
        "role": "doctor",
        "specialization": null
      },
      "discharge_date": "2026-11-25T10:14:07.724910Z",
      "ward_info": { "sqid": "K3yyGbv", "name": "Female Medical Ward" },
      "bed_info": { "bed_number": 2, "status": "available", "sqid": "8P66jpb" },
      "doctor_discharge_form": {
        "sqid": "2mcUj1o",
        "primary_diagnosis": "Malaria",
        "secondary_diagnosis": "None",
        "comorbidities": "None",
        "hospital_course_note": "Treated with antimalarials",
        "chief_complaint": "Fever",
        "treatment_plan": "Rest",
        "care_instructions": "Review in a week",
        "condition_at_discharge": "stable",
        "follow_up_clinic": "Lagoon General Hospital",
        "follow_up_date": "2026-12-02",
        "follow_up_time": "10:30:00",
        "follow_up_instructions": "Return if fever recurs",
        "pending_investigations": [],
        "completed_investigations": [],
        "discharged_by_info": {
          "sqid": "KDN3VMb",
          "firstname": "Tunde",
          "lastname": "Bello",
          "role": "doctor",
          "specialization": null
        },
        "created_at": "2026-11-25T10:14:23.219228Z"
      },
      "nurse_discharge_form": null
    }
  ]
}
```

- `created_at` is when the patient was admitted.
- `discharged_by_info` is the doctor who signed the discharge form, and `null` when there is no doctor's form.
- `doctor_discharge_form` and `nurse_discharge_form` are each `null` when that form was not written.

### 3. Single staff management

`GET /api/hospital-ops/staff/<sqid>` returns one staff member's metrics and profile that can be used on the Single Staff Management dashboard.

**Request**

```
GET /api/hospital-ops/staff/KDN3VMb?period=month
```

`<sqid>` is the staff member's membership sqid. It must be a staff member you can reach, or the endpoint returns a `404`.

**Response `200`**

```json
{
  "total_patients_seen": 1,
  "appointments_completed": 1,
  "follow_ups_requested": 1,
  "staff_info": {
    "sqid": "KDN3VMb",
    "firstname": "Tunde",
    "lastname": "Bello",
    "role": "doctor",
    "gender": "male",
    "joined_at": "2026-11-25T10:14:08.036719Z",
    "email": "tunde.bello@example.com",
    "added_by_info": {
      "firstname": "Ngozi",
      "lastname": "Eze",
      "email": "ngozi.eze@example.com"
    }
  }
}
```

| Field                      | Meaning                                                                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `total_patients_seen`      | Distinct patients in the staff member's clinical interactions created in the period                                                                                                    |
| `appointments_completed`   | Completed appointments, filtered by when they were closed                                                                                                                              |
| `follow_ups_requested`     | Appointments the staff member booked from a consultation, filtered by when they were booked                                                                                            |
| `staff_info.joined_at`     | When the membership was created                                                                                                                                                        |
| `staff_info.added_by_info` | The account that added the staff member. `null` for staff added before this was recorded. `firstname` and `lastname` are `null` when a DH admin added them; `email` is always present. |

There are no `change` fields on this endpoint.

### 4. Hospital administration metrics

`GET /api/hospital-ops/administration-metrics` returns staff and facility counts that can be used on the Hospital Admin Dashboard.

**Request**

```
GET /api/hospital-ops/administration-metrics?timeframe=week
```

The parameter is named `timeframe` here, not `period`. It takes the same values.

**Response `200`**

```json
{
  "total_staff": 5,
  "added_this_duration": { "count": 5, "change": 5 },
  "administrators": 1,
  "total_facilities": 2
}
```

| Field                 | Meaning                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `total_staff`         | Active staff at the hospital and its attached lab, pharmacy and radiology unit. Ignores `timeframe`.                                     |
| `added_this_duration` | Staff added in the timeframe. `change` is a number difference. Without `timeframe`, `count` equals `total_staff` and `change` is `null`. |
| `administrators`      | Staff with admin rights. Ignores `timeframe`.                                                                                            |
| `total_facilities`    | The hospital plus the arms it can reach (lab, pharmacy, radiology). Ignores `timeframe`.                                                 |

### 5. Staff counts by role

`GET /api/hospital-ops/staff-role-counts` returns staff counts per role that can be used on the Hospital Admin Dashboard.

**Request**

```
GET /api/hospital-ops/staff-role-counts
```

**Response `200`**

A plain array, **not paginated**, sorted by role name:

```json
[
  { "role": "doctor", "count": 2 },
  { "role": "lab_scientist", "count": 1 },
  { "role": "nurse", "count": 1 },
  { "role": "receptionist", "count": 1 }
]
```

- Includes staff at the attached lab, pharmacy and radiology unit.
- A role appears only when it has at least one active member.
- Admins with no role are left out.

### 6. Receptionist operation metrics

`GET /api/hospital-ops/operation-metrics` returns check-in and appointment metrics that can be used on the Receptionist Dashboard metric cards.

**Request**

```
GET /api/hospital-ops/operation-metrics?period=day
```

**Response `200`**

```json
{
  "total_checkins": 1240,
  "pending_checkins": 5,
  "check_ins_this_hour": { "count": 6, "change": 50.0 },
  "this_period_appointments": { "count": 20, "percent_change": 11.11 }
}
```

| Field                      | Meaning                                                                                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `total_checkins`           | Every check-in ever at your hospital. Ignores `period`.                                                                                                                                                                                                                |
| `pending_checkins`         | Check-ins still waiting for a nurse (`pending`) that were created in the period. All time without `period`.                                                                                                                                                            |
| `check_ins_this_hour`      | Check-ins created in the current clock hour (for example 14:00 to 15:00). **Ignores `period`.** Despite its name, `change` here is a **percent** change from the previous hour, and `null` when the previous hour had none. Can be used for a "Waiting in Queue" card. |
| `this_period_appointments` | Appointments scheduled in the period. `percent_change` against the previous period.                                                                                                                                                                                    |

### 7. Hospital check-in list

`GET /api/hospital-ops/patients-check-ins` returns a paginated check-in list that can be used on the Receptionist Dashboard and the Hospital Admin Dashboard.

**Request**

```
GET /api/hospital-ops/patients-check-ins?search=Amaka&page=1&size=10
```

`search` matches the patient's first, middle or last name, HIN or phone number.

**Response `200`**

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "KNm960Z",
      "patient_info": {
        "sqid": "uYFaLoS",
        "firstname": "Amaka",
        "lastname": "Okafor",
        "hin": "DH12345678"
      },
      "status": "nursing_active",
      "created_at": "2026-11-25T10:14:08.081427Z"
    },
    {
      "sqid": "vbVwBaG",
      "patient_info": {
        "sqid": "uYFaLoS",
        "firstname": "Amaka",
        "lastname": "Okafor",
        "hin": "DH12345678"
      },
      "status": "closed",
      "created_at": "2026-11-20T10:14:07.724910Z"
    }
  ]
}
```

- Every check-in at your hospital, newest first, closed ones included. There is no status filter.
- `status` is one of `pending`, `nursing_active`, `nursing_idle`, `doctor_idle`, `doctor_active`, `doctor_seen`, `closed`.
- Wait time is not returned. For an open check-in it can be computed as now minus `created_at`.

### 8. Appointments overview

`GET /api/hospital-ops/appointments-overview` returns appointment metrics that can be used on the Appointments Dashboard metric cards.

**Request**

```
GET /api/hospital-ops/appointments-overview?period=week
```

**Response `200`**

```json
{
  "appointments_booked": { "count": 11, "percent_change": -8.33 },
  "in_progress_appointments": 2,
  "cancelled_appointments": { "count": 3, "change": -1 }
}
```

| Field                      | Meaning                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `appointments_booked`      | Appointments scheduled in the period, any status. `percent_change` against the previous period.                                                                                                  |
| `in_progress_appointments` | Appointments booked from a consultation whose consultation is still in progress, scheduled in the period. Appointments booked at the desk are not linked to a consultation, so they never count. |
| `cancelled_appointments`   | Cancelled appointments, counted by **when they were booked**, because no cancellation time is stored. `change` is a number difference.                                                           |

Without `period`, every count is all time, `percent_change` and `change` are `null`.

### 9. Patient visit metrics (the patient's own)

`GET /api/patients/visit-metrics` returns the logged-in patient's visit numbers that can be used on the Single Patient Dashboard.

**Request**

```
GET /api/patients/visit-metrics
```

**Response `200`**

```json
{
  "total_visits": 3,
  "last_visit": "2026-11-25T10:14:08.081427Z",
  "last_check_in": "2026-11-25T10:14:08.081427Z",
  "upcoming_appointment": {
    "sqid": "Bwv5MFJ",
    "status": "pending",
    "scheduled_time": "2026-11-28T10:14:07.724910Z"
  },
  "patient_info": {
    "firstname": "Amaka",
    "lastname": "Okafor",
    "dob": "1988-04-12",
    "gender": "female",
    "hin": "DH12345678",
    "phone_num": "08031234567",
    "email": "amaka@example.com",
    "acct_type": null
  }
}
```

| Field                    | Meaning                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `total_visits`           | Check-ins plus confirmed or completed appointments, at every hospital                        |
| `last_visit`             | The latest of those: a check-in's time or an appointment's scheduled time. `null` when none. |
| `last_check_in`          | The latest check-in's time, or `null`                                                        |
| `upcoming_appointment`   | The pending appointment scheduled soonest from now, or `null`                                |
| `patient_info.acct_type` | Always `null` here, because a patient pays differently at each hospital                      |

### 9b. Patient visit metrics by HIN

`GET /api/patients/<hin>/visit-metrics` returns the same numbers for the patient with this HIN, counted at your hospital only. It can be used when staff open the Single Patient Dashboard.

**Request**

```
GET /api/patients/DH12345678/visit-metrics
```

**Response `200`**

Same shape as endpoint 9, with these differences:

- `total_visits`, `last_visit`, `last_check_in` and `upcoming_appointment` count only your hospital.
- `patient_info.acct_type` is `private`, `hmo` or `company`: how the patient pays at your hospital. It is `private` when never set.
- `patient_info.email` is `null` for a dependant.

Example for a dependant with no upcoming appointment:

```json
{
  "total_visits": 2,
  "last_visit": "2026-11-25T10:14:08.081427Z",
  "last_check_in": "2026-11-25T10:14:08.081427Z",
  "upcoming_appointment": null,
  "patient_info": {
    "firstname": "Chidi",
    "lastname": "Okafor",
    "dob": "2015-06-01",
    "gender": "male",
    "hin": "7894623012343",
    "phone_num": "",
    "email": null,
    "acct_type": "private"
  }
}
```

An unknown HIN returns a `404`.

### 10. Dependants with last visit (the patient's own)

`GET /api/patients/guardianship` returns the logged-in patient's dependants that can be used on the Single Patient Dashboard dependants section.

**Request**

```
GET /api/patients/guardianship?page=1&size=10
```

**Response `200`**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "DugImRQ",
      "hin": "7894623012343",
      "firstname": "Chidi",
      "lastname": "Okafor",
      "dob": "2015-06-01",
      "gender": "male",
      "last_visit": "2026-11-25T10:14:08.081427Z"
    }
  ]
}
```

- Newest link first.
- `last_visit` is the dependant's latest check-in, or confirmed or completed appointment, at any hospital, or `null`.
- A patient who logs in is never a dependant, so this route always lists dependants.

### 10b. Dependants or guardians by HIN

`GET /api/patients/<hin>/guardianship` returns the linked patients of the patient with this HIN. It can be used when staff open the Single Patient Dashboard.

**Request**

```
GET /api/patients/7894623012343/guardianship
```

**Response `200`**

Rows have the same fields as endpoint 10. The example looks up a child, so it lists the child's guardian:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "uYFaLoS",
      "hin": "DH12345678",
      "firstname": "Amaka",
      "lastname": "Okafor",
      "dob": "1988-04-12",
      "gender": "female",
      "last_visit": "2026-11-25T10:14:08.081427Z"
    }
  ]
}
```

- **Who is listed:** the patient's active guardians when the patient is a dependant, otherwise their dependants.
- **`last_visit`:** counts only your hospital.
- An unknown HIN returns a `404`.

### 11. Visits (the patient's own)

`GET /api/patients/visits` returns the logged-in patient's check-ins and appointments at every hospital, newest first. It can be used on the Single Patient Dashboard visit tabs.

**Request**

```
GET /api/patients/visits                      # combined timeline
GET /api/patients/visits?type=check-ins       # check-ins only
GET /api/patients/visits?type=appointments    # appointments only
```

Any other `type` returns a `400`: `{"type": "type must be 'check-ins' or 'appointments', or left out for both."}`

**Response `200`, no `type` (timeline)**

Each row has `type` (`appointment` or `check-in`), `time`, `appointment` and `check_in`. One of the last two is `null`. An appointment is placed at its scheduled time, so a future booking sits at the top. A check-in is placed at its creation time.

```json
{
  "count": 5,
  "next": "https://<host>/api/patients/visits?page=2&size=2",
  "previous": null,
  "results": [
    {
      "type": "appointment",
      "time": "2026-11-28T10:14:07.724910Z",
      "appointment": {
        "id": 2,
        "sqid": "Bwv5MFJ",
        "status": "pending",
        "scheduled_time": "2026-11-28T10:14:07.724910Z",
        "staff": {
          "sqid": "KDN3VMb",
          "firstname": "Tunde",
          "lastname": "Bello",
          "role": "doctor",
          "specialization": null
        },
        "patient": {
          "dob": "1988-04-12",
          "gender": "female",
          "phone_num": "08031234567",
          "firstname": "Amaka",
          "lastname": "Okafor",
          "middlename": null,
          "hin": "DH12345678",
          "street": "12 Allen Avenue",
          "city": "Ikeja",
          "state": "Lagos",
          "country": "Nigeria",
          "email": "amaka@example.com",
          "contact_email": null,
          "payment_provider": null
        },
        "last_visited": "2026-11-23T10:14:07.724910Z",
        "note": "Review blood pressure",
        "type": "follow-up",
        "hospital_info": {
          "name": "Lagoon General Hospital",
          "email": "info@lagoongeneral.example.com",
          "sqid": "0UdrKQw"
        },
        "closed_at": null,
        "closed_by_info": null
      },
      "check_in": null
    },
    {
      "type": "check-in",
      "time": "2026-11-25T10:14:08.081427Z",
      "appointment": null,
      "check_in": {
        "sqid": "KNm960Z",
        "status": "nursing_active",
        "hospital_info": {
          "name": "Lagoon General Hospital",
          "email": "info@lagoongeneral.example.com",
          "sqid": "0UdrKQw"
        },
        "patient_info": {
          "hin": "DH12345678",
          "firstname": "Amaka",
          "lastname": "Okafor",
          "gender": "female",
          "dob": "1988-04-12"
        },
        "created_at": "2026-11-25T10:14:08.081427Z",
        "escalated_at": null,
        "closed_at": null
      }
    }
  ]
}
```

**Response `200`, `type=check-ins` or `type=appointments`**

Each item in `results` is the inner `check_in` or `appointment` object above, with no `type` / `time` wrapper:

```json
{
  "count": 2,
  "next": "https://<host>/api/patients/visits?page=2&size=1&type=check-ins",
  "previous": null,
  "results": [
    {
      "sqid": "KNm960Z",
      "status": "nursing_active",
      "hospital_info": {
        "name": "Lagoon General Hospital",
        "email": "info@lagoongeneral.example.com",
        "sqid": "0UdrKQw"
      },
      "patient_info": {
        "hin": "DH12345678",
        "firstname": "Amaka",
        "lastname": "Okafor",
        "gender": "female",
        "dob": "1988-04-12"
      },
      "created_at": "2026-11-25T10:14:08.081427Z",
      "escalated_at": null,
      "closed_at": null
    }
  ]
}
```

Notes on the `appointment` object:

- Appointments of every status are listed: `pending`, `confirmed`, `cancelled`, `completed`.
- `note` and `type` are free text and can be `null`.
- `last_visited` can be `null`.
- `closed_by_info` is `null` until a staff member closes the appointment.
- `patient.payment_provider` is always `null` on this route, because a patient pays differently at each hospital.
- For a dependant, the `patient.email` key is missing, as in endpoint 2.

### 11b. Visits by HIN

`GET /api/patients/<hin>/visits` returns the same three lists for the patient with this HIN, limited to your hospital. It can be used when staff open the Single Patient Dashboard.

**Request**

```
GET /api/patients/DH12345678/visits?type=appointments&size=1
```

**Response `200`**

Rows are shaped exactly as in endpoint 11. The one difference is that `patient.payment_provider` is filled in with how the patient pays at your hospital:

```json
"payment_provider": { "type": "hmo", "provider": null, "member_id": null, "updated_at": "2026-11-25T10:14:08.081427Z" }
```

An unknown HIN returns a `404`.

---

## Part 3 - Fields the endpoints do not return

These come from the dashboard designs but are not available today. They are listed so the UI can hide them or show a placeholder.

| Dashboard          | Field                                                            | Status                                                                         |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Patient Management | Visit type                                                       | Not stored on check-ins                                                        |
| Patient Management | Checked-in by                                                    | Not stored on check-ins                                                        |
| Patient Management | Search by HIN or phone on the patient lists                      | Endpoint 2 searches names and email only                                       |
| Single Staff       | Staff ID, date of birth, access roles                            | Not stored                                                                     |
| Single Staff       | Appointments this month                                          | Not returned                                                                   |
| Receptionist       | Check-in wait time                                               | Not returned; compute now minus `created_at` for open check-ins                |
| Receptionist       | Appointment reason from a preset list                            | Not built; `type` and `note` are free text                                     |
| Receptionist       | Appointment status upcoming / checked-in / in-progress / arrived | Appointments store only `pending`, `confirmed`, `cancelled`, `completed`       |
| Appointments       | Checked-in count for desk-booked appointments                    | `in_progress_appointments` counts only appointments booked from a consultation |
