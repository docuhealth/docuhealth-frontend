# Appointments - Frontend Handoff

## Part 1 - Before you start

### Basics

**Base path.** Every endpoint here starts with `/api/hospital-ops/appointments`.

**Auth.** Send `Authorization: Bearer <token>`. Who may call each endpoint is in the table below. A wrong role gets a `403`, and a missing or expired token gets a `401`.

**Pagination.** The three lists take `page` and `size` (default 10, maximum 100) and return `{"count", "next", "previous", "results"}`. `next` and `previous` are full URLs.

**Times.** Send `scheduled_time` as ISO 8601 with a zone, for example `2026-12-01T10:00:00Z`. `today`, `tomorrow`, `upcoming` and `history` are worked out in **UTC**, so "today" runs from 01:00 to 01:00 in Lagos.

**Errors.** Bodies use DRF's shapes:

| Status | Body                                                                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `400`  | `{"<field>": ["<message>"]}`. When the appointment's status refuses the change, the key is `appointment`: `{"appointment": ["Only a pending or confirmed appointment can be cancelled"]}`. |
| `401`  | `{"detail": "Authentication credentials were not provided."}`                                                                                                                              |
| `403`  | `{"detail": "You do not have permission to perform this action."}`                                                                                                                         |
| `404`  | `{"detail": "No Appointment matches the given query."}`                                                                                                                                    |

### Endpoint list

| #   | Endpoint                   | Who can call it                                  | Can be used for                                                           |
| --- | -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| 1   | `POST /book`               | Receptionist                                     | Booking at the front desk                                                 |
| 2   | `POST /request`            | Patient                                          | Booking from the patient app                                              |
| 3   | `POST /<sqid>/confirm`     | Receptionist                                     | Confirming a patient's booking and naming who will see them               |
| 4   | `PATCH /<sqid>/reschedule` | Patient (own) or receptionist (own hospital)     | Moving an appointment                                                     |
| 5   | `POST /<sqid>/cancel`      | Patient (own) or receptionist (own hospital)     | Cancelling                                                                |
| 6   | `POST /<sqid>/close`       | Hospital staff of the booked staff member's role | Marking the patient as seen                                               |
| 7   | `PATCH /<sqid>/assign`     | Nurse (appointments booked with them)            | Passing an appointment to a doctor                                        |
| 8   | `GET /`                    | Receptionist or hospital admin                   | The hospital's appointment list (today, tomorrow, upcoming, history tabs) |
| 9   | `GET /mine`                | Patient                                          | The patient's own appointments                                            |
| 10  | `GET /staff`               | Any hospital staff                               | The logged-in staff member's appointments                                 |

### What Swagger shows

- **Success responses:** all ten endpoints show the correct success schema, except close (see endpoint 6).
- **Error responses:** book, request, reschedule, cancel and assign document their `400`, `401`, `403` and `404` with example bodies. Confirm, close and the three lists document only their success response; their errors are listed in this note.
- **Reschedule request:** Swagger correctly marks `scheduled_time` as required, even though the endpoint is a `PATCH`.

---

## Part 2 - Endpoints

### Shared shapes

**Appointment object** (`HospitalAppointment` in Swagger). Returned by confirm and by the three lists:

```json
{
  "id": 30,
  "sqid": "tAQyVge",
  "status": "pending",
  "scheduled_time": "2026-11-30T10:00:00Z",
  "staff": {
    "sqid": "AM8dMkr",
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
    "payment_provider": {
      "type": "private",
      "provider": null,
      "member_id": null,
      "updated_at": null
    }
  },
  "last_visited": "2026-11-22T10:00:00Z",
  "note": "Recurring headaches",
  "type": "follow-up",
  "cancellation_reason": null,
  "reschedule_reason": null,
  "hospital_info": {
    "name": "Lagoon General Hospital",
    "email": "info@lagoongeneral.example.com",
    "sqid": "0UdrKQw"
  },
  "closed_at": null,
  "closed_by_info": null
}
```

- `status` is `pending`, `confirmed`, `cancelled` or `completed`.
- `staff` can be `null` on older appointments.
- `last_visited` is the scheduled time of the patient's latest completed appointment before this one, or `null`.
- `note`, `type`, `cancellation_reason` and `reschedule_reason` are free text and can be `null`.
- `patient.payment_provider` is how the patient pays at the hospital. It is `null` on `/mine` and on confirm, and filled in on `/` and `/staff`.
- `closed_at` and `closed_by_info` are set once the appointment is closed.

**Booking response** (`BookAppointmentRead`). Returned by book and request:

```json
{
  "staff_info": {
    "sqid": "AM8dMkr",
    "firstname": "Tunde",
    "lastname": "Bello",
    "phone_num": "08000000001",
    "role": "doctor",
    "email": "tunde.bello@example.com",
    "gender": "male",
    "is_active": true
  },
  "patient_info": {
    "hin": "DH12345678",
    "firstname": "Amaka",
    "lastname": "Okafor",
    "gender": "female",
    "dob": "1988-04-12"
  },
  "type": "review",
  "note": "Recurring headaches",
  "scheduled_time": "2026-11-28T10:00:00Z",
  "hospital": "0UdrKQw"
}
```

This response has no `sqid` or `status`. A new appointment is always `pending`. To get its `sqid`, reload `/` or `/mine`.

---

### 1. Book at the desk

`POST /api/hospital-ops/appointments/book` books a patient with a staff member of the receptionist's hospital. It can be used for booking at the front desk.

**Request**

```json
{
  "patient": "DH12345678",
  "staff": "AM8dMkr",
  "scheduled_time": "2026-12-01T10:00:00Z",
  "type": "review",
  "note": "Recurring headaches"
}
```

| Field            | Required | Notes                                       |
| ---------------- | -------- | ------------------------------------------- |
| `patient`        | Yes      | The patient's HIN                           |
| `staff`          | Yes      | The sqid of a staff member at your hospital |
| `scheduled_time` | Yes      | Must be in the future                       |
| `type`           | No       | Free text, at most 20 characters            |
| `note`           | No       | Free text: the reason for the visit         |

The appointment is always booked at the receptionist's own hospital. A `hospital` field in the body is ignored.

**Response `201`:** the booking response above.

**Errors**

| Status | When                             | Body                                                                                                                 |
| ------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `400`  | Missing fields                   | `{"patient": ["This field is required."], "staff": ["This field is required."]}`                                     |
| `400`  | Staff member at another hospital | `{"staff": ["Staff not found at this hospital."]}`                                                                   |
| `400`  | Unknown HIN or staff sqid        | `{"patient": ["Object with hin=DH00000000 does not exist."], "staff": ["Object with sqid=abc1234 does not exist."]}` |
| `400`  | Time in the past                 | `{"scheduled_time": ["Choose a time in the future."]}`                                                               |
| `400`  | `type` too long                  | `{"type": ["Ensure this field has no more than 20 characters."]}`                                                    |
| `403`  | Not a receptionist               | `{"detail": "You do not have permission to perform this action."}`                                                   |

### 2. Request from the app

`POST /api/hospital-ops/appointments/request` lets a patient book for themselves. It can be used for booking from the patient app.

**Request**

```json
{
  "hospital": "0UdrKQw",
  "staff": "AM8dMkr",
  "scheduled_time": "2026-12-01T10:00:00Z",
  "note": "Knee pain"
}
```

| Field            | Required | Notes                                       |
| ---------------- | -------- | ------------------------------------------- |
| `hospital`       | Yes      | The hospital's sqid                         |
| `staff`          | Yes      | The sqid of a staff member at that hospital |
| `scheduled_time` | Yes      | Must be in the future                       |
| `type`, `note`   | No       | As in endpoint 1                            |

The appointment is always for the logged-in patient. A `patient` field in the body is ignored.

**Response `201`:** the booking response above.

**Errors**

| Status | When                              | Body                                                                              |
| ------ | --------------------------------- | --------------------------------------------------------------------------------- |
| `400`  | Missing fields                    | `{"hospital": ["This field is required."], "staff": ["This field is required."]}` |
| `400`  | Staff member not at that hospital | `{"staff": ["Staff not found at this hospital."]}`                                |
| `400`  | Unknown hospital                  | `{"hospital": ["Object with sqid=abc1234 does not exist."]}`                      |
| `400`  | Time in the past                  | `{"scheduled_time": ["Choose a time in the future."]}`                            |
| `403`  | Not a patient                     | `{"detail": "You do not have permission to perform this action."}`                |

### 3. Confirm

`POST /api/hospital-ops/appointments/<sqid>/confirm` moves a `pending` appointment to `confirmed` and names the staff member who will see the patient, replacing any already named. It can be used for confirming bookings that patients made from the app.

**Request**

```json
{ "staff": "vAX2PqQ" }
```

`staff` is required: the sqid of a staff member at your hospital.

**Response `200`:** the full appointment object, with `status: "confirmed"` and the new `staff`.

**Errors**

| Status | When                             | Body                                                               |
| ------ | -------------------------------- | ------------------------------------------------------------------ |
| `400`  | Not `pending`                    | `{"appointment": ["Only a pending appointment can be confirmed"]}` |
| `400`  | No `staff`                       | `{"staff": ["This field is required."]}`                           |
| `400`  | Staff member at another hospital | `{"staff": ["Staff not found at this hospital."]}`                 |
| `403`  | Not a receptionist               | `{"detail": "You do not have permission to perform this action."}` |
| `404`  | Appointment not at your hospital | `{"detail": "No Appointment matches the given query."}`            |

### 4. Reschedule

`PATCH /api/hospital-ops/appointments/<sqid>/reschedule` moves a `pending` or `confirmed` appointment to a new time. It can be used by the patient app and the front desk.

**Request**

```json
{
  "scheduled_time": "2026-12-01T15:00:00Z",
  "reschedule_reason": "Moved to the afternoon",
  "type": "review",
  "note": "Bring previous scan results"
}
```

| Field               | Required | Notes                                                                                                 |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `scheduled_time`    | Yes      | In the future and different from the current time                                                     |
| `reschedule_reason` | No       | Why the time moved                                                                                    |
| `type`              | No       | Replaces the type when sent                                                                           |
| `note`              | No       | Replaces the booking note **only when sent**. Leave it out to keep the original reason for the visit. |

- **A patient** can reschedule only their own appointments. A `confirmed` appointment goes back to `pending`, so the hospital confirms the new time.
- **A receptionist** can reschedule any appointment at their hospital, and the status stays the same.

**Response `200`**

```json
{
  "type": null,
  "note": "Recurring headaches",
  "scheduled_time": "2026-12-01T15:00:00Z",
  "reschedule_reason": "Moved to the afternoon",
  "sqid": "hwtBo0u",
  "status": "pending"
}
```

**Errors**

| Status | When                                                      | Body                                                                                        |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `400`  | No `scheduled_time`                                       | `{"scheduled_time": ["This field is required."]}`                                           |
| `400`  | Same time as now                                          | `{"scheduled_time": ["The appointment is already at this time. Choose a different time."]}` |
| `400`  | Time in the past                                          | `{"scheduled_time": ["Choose a time in the future."]}`                                      |
| `400`  | `cancelled` or `completed`                                | `{"appointment": ["Only a pending or confirmed appointment can be rescheduled"]}`           |
| `403`  | Neither a patient nor a receptionist                      | `{"detail": "You do not have permission to perform this action."}`                          |
| `404`  | Another patient's appointment, or one at another hospital | `{"detail": "No Appointment matches the given query."}`                                     |

### 5. Cancel

`POST /api/hospital-ops/appointments/<sqid>/cancel` cancels a `pending` or `confirmed` appointment. It can be used by the patient app and the front desk. Who may cancel what is the same as for reschedule.

**Request**

```json
{ "cancellation_reason": "Feeling better" }
```

`cancellation_reason` is optional. An empty body `{}` works.

**Response `200`**

```json
{
  "cancellation_reason": "Feeling better",
  "reschedule_reason": null,
  "sqid": "JdjeG15",
  "status": "cancelled"
}
```

**Errors**

| Status | When                                                      | Body                                                                            |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `400`  | Already `cancelled` or `completed`                        | `{"appointment": ["Only a pending or confirmed appointment can be cancelled"]}` |
| `403`  | Neither a patient nor a receptionist                      | `{"detail": "You do not have permission to perform this action."}`              |
| `404`  | Another patient's appointment, or one at another hospital | `{"detail": "No Appointment matches the given query."}`                         |

### 6. Close

`POST /api/hospital-ops/appointments/<sqid>/close` marks an appointment `completed` once the patient has been seen. It can be used on the staff screens after a consultation.

**Request:** no body.

**Who can close:** any staff member at the appointment's hospital who has the same role as the booked staff member. A doctor can close another doctor's appointment, but a nurse can't close a doctor's.

**Response `200`**

```json
{ "detail": "Appointment closed successfully." }
```

Swagger shows this as "No response body", but the endpoint returns the body above.

**Errors.** Their shapes are less consistent than the other endpoints':

| Status | When                                        | Body                                                                    |
| ------ | ------------------------------------------- | ----------------------------------------------------------------------- |
| `400`  | Already closed                              | `{"appointment": ["This appointment is already closed."]}`              |
| `400`  | `cancelled`                                 | `{"appointment": ["A cancelled appointment cannot be closed"]}`         |
| `400`  | At another hospital (a `400`, not a `404`)  | `{"appointment": ["Appointment not found at this hospital."]}`          |
| `403`  | Different role from the booked staff member | `{"detail": "Only staff of the same role can close this appointment."}` |
| `403`  | Not hospital staff                          | `{"detail": "You do not have permission to perform this action."}`      |
| `404`  | Unknown sqid                                | `{"detail": "No Appointment matches the given query."}`                 |
| `500`  | The appointment has no staff member         | No usable body. See Part 3.                                             |

### 7. Pass to a doctor

`PATCH /api/hospital-ops/appointments/<sqid>/assign` lets a nurse hand an appointment booked with them to a doctor at their hospital, and change its time, type or note at the same time. It can be used on the nurse's appointment screen.

**Request:** every field is optional.

```json
{
  "doctor_id": "AM8dMkr",
  "scheduled_time": "2026-12-02T09:00:00Z",
  "type": "review",
  "note": "Needs a doctor"
}
```

`doctor_id` is the doctor's sqid. It must be an active doctor at your hospital.

**Response `200`**

```json
{ "note": null, "type": null, "scheduled_time": "2026-11-27T10:00:00Z" }
```

The response doesn't show the doctor. Once a doctor is assigned, the appointment leaves the nurse's lists, and a second call from the same nurse returns `404`.

**Errors**

| Status | When                                 | Body                                                               |
| ------ | ------------------------------------ | ------------------------------------------------------------------ |
| `400`  | Doctor at another hospital           | `{"doctor_id": ["Doctor not found at this hospital."]}`            |
| `400`  | Unknown doctor                       | `{"doctor_id": ["Object with sqid=abc1234 does not exist."]}`      |
| `403`  | Not a nurse                          | `{"detail": "You do not have permission to perform this action."}` |
| `404`  | Not booked with you at your hospital | `{"detail": "No Appointment matches the given query."}`            |

### 8. Hospital appointment list

`GET /api/hospital-ops/appointments` returns the hospital's appointments, paginated. It can be used for the receptionist's and hospital admin's appointment tabs.

**Request**

```
GET /api/hospital-ops/appointments?timeframe=today&search=Amaka&status=pending&page=1&size=10
```

| Parameter                                  | Required | Values                                                                                                       |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `timeframe`                                | Yes      | `today`, `tomorrow`, `upcoming` (after tomorrow) or `history` (before today). The first three don't overlap. |
| `search`                                   | No       | Patient's first, middle or last name, or email. Not HIN or phone.                                            |
| `status`                                   | No       | `pending`, `confirmed`, `cancelled` or `completed`                                                           |
| `scheduled_time_gte`, `scheduled_time_lte` | No       | ISO 8601 bounds on `scheduled_time`                                                                          |

**Response `200`:** a paginated list of appointment objects, sorted by `scheduled_time`, earliest first.

**Errors**

| Status | When                                 | Body                                                                                                                                |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Missing or unknown `timeframe`       | `{"timeframe": "This query parameter is required."}`. The message is a plain string, not a list, and is the same for a wrong value. |
| `403`  | Not a receptionist or hospital admin | `{"detail": "You do not have permission to perform this action."}`                                                                  |

### 9. The patient's own appointments

`GET /api/hospital-ops/appointments/mine` returns the logged-in patient's appointments at every hospital, paginated, newest first. It can be used on the patient app's appointment screen.

**Request:** `page` and `size` only.

**Response `200`:** a paginated list of appointment objects. `patient.payment_provider` is `null` here.

**Errors:** `403` if the caller isn't a patient.

### 10. The staff member's own appointments

`GET /api/hospital-ops/appointments/staff` returns the logged-in staff member's appointments at their hospital, paginated, earliest first. Lab scientists and radiologists see every appointment booked with anyone in their role. It can be used on staff dashboards.

**Request:** the same parameters as endpoint 8, except that `timeframe` takes `today`, `upcoming` or `history` (no `tomorrow`).

| `timeframe` | Returns                                                      |
| ----------- | ------------------------------------------------------------ |
| `today`     | The whole of today, including times that have already passed |
| `upcoming`  | After today. Later today is in `today`, not here.            |
| `history`   | Before today                                                 |

Swagger describes `today` as "the rest of today" and `upcoming` as "later today or on a future day". Follow the table above; it's what the endpoint does.

**Response `200`:** a paginated list of appointment objects.

**Errors:** `400` for a missing or unknown `timeframe` (same plain-string body as endpoint 8), and `403` if the caller isn't hospital staff.
