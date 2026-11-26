# Appointments - Booking Discovery Handoff

Two new endpoints let a patient find a hospital and a staff member before booking from the app. Together with the existing appointment endpoints, they cover the full flow in `docs/flows/managing-appointments.md`, from finding a hospital to closing or cancelling the appointment.

## Summary

| #   | Endpoint                                      | Who can call it | New or changed                             |
| --- | --------------------------------------------- | --------------- | ------------------------------------------ |
| 1   | `GET /api/auth/facilities/hospitals/public`   | Patient         | New                                        |
| 2   | `GET /api/hospital-ops/<hospital_sqid>/staff` | Patient         | New                                        |
| 3   | `POST /api/hospital-ops/appointments/request` | Patient         | Unchanged. It takes the sqids from 1 and 2 |

**How a patient books from the app:**

```text
GET  /api/auth/facilities/hospitals/public          -> pick a hospital, keep its sqid
GET  /api/hospital-ops/<sqid>/staff        -> pick a staff member, keep their sqid
POST /api/hospital-ops/appointments/request          -> { hospital, staff, scheduled_time }
```

**Both lists** are paginated with `page` and `size` (default 10, maximum 100) and return `{"count", "next", "previous", "results"}`. Both take `search`, which matches part of a word and ignores case. Any role other than patient gets a `403`.

---

## 1. List hospitals a patient can book at

`GET /api/auth/facilities/hospitals/public`

- Lists every **active** hospital, sorted by name. Inactive hospitals and the hospitals' laboratory, pharmacy and radiology units are not listed.
- `search` matches part of the hospital's name.
- `profile_image` (the logo) and `bg_image` are URLs or `null`.

```http
GET /api/auth/facilities/hospitals/public?search=lagoon
```

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "Xk3pQ9a",
      "name": "Lagoon General Hospital",
      "email": "info@lagoon.example",
      "phone": "+2348031234567",
      "profile_image": "https://cdn.example/logo.png",
      "bg_image": null
    }
  ]
}
```

Pass `sqid` as `hospital` when requesting an appointment, and use it in the path of endpoint 2.

---

## 2. List the staff a patient can book with at a hospital

`GET /api/hospital-ops/<hospital_sqid>/staff`

- Lists the people working at the hospital, **including** its laboratory, pharmacy and radiology units, sorted by first name, then last name.
- Each person shows only `sqid`, `firstname`, `lastname`, `role` and `specialization`. Email, phone, gender and account state are never shown.
- `search` matches part of a first name, last name or specialization (for example `cardio`).
- Left out of the list:

| Left out                                                | Why                                 |
| ------------------------------------------------------- | ----------------------------------- |
| Staff removed from the hospital                         | They no longer work there           |
| Staff whose account is deactivated                      | They cannot see patients            |
| A hospital admin who has not yet given their staff role | Their name and role are still blank |

```http
GET /api/hospital-ops/Xk3pQ9a/staff?search=cardio
```

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "sqid": "AM8dMkr",
      "firstname": "Ada",
      "lastname": "Obi",
      "role": "doctor",
      "specialization": "Cardiology"
    }
  ]
}
```

`specialization` can be `null`. `role` is one of `doctor`, `nurse`, `receptionist`, `lab_scientist`, `pharmacist`, `radiologist`, `radiographer`.

**Errors**

| Status | When                                                                    | Body                                                               |
| ------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `403`  | The caller is not a patient                                             | `{"detail": "You do not have permission to perform this action."}` |
| `404`  | No active hospital has this sqid (unknown, inactive, or not a hospital) | `{"detail": "No Facility matches the given query."}`               |

Pass a person's `sqid` as `staff` when requesting an appointment. Everyone on this list can be booked.

---

## 3. Appointment time slots

Appointment time slots haven't been implemented yet so appointments can be booked at anytime so far the time is not in the past.

---

## Changes to existing endpoints

None. `POST /api/hospital-ops/appointments/request` still takes:

```json
{
  "hospital": "Xk3pQ9a",
  "staff": "AM8dMkr",
  "scheduled_time": "2026-12-01T10:00:00Z",
  "type": "consultation",
  "note": "Chest pain on exertion"
}
```

`type` and `note` are optional. The appointment starts as `pending`. The rest of the flow (confirm, reschedule, cancel, close, nurse assign, the three lists) works as described in `APPOINTMENTS-HANDOFF.md`.
