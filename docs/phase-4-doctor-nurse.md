# Phase 4: Doctor and Nurse, from v1 to v2

What v1's doctor and nurse dashboards do, the endpoints behind them on the real API
(`docs/api/openapi.json`, as checked on staging), and the order Phase 4 builds them in. There are
no designs for these dashboards: they're built from v1's behaviour with v2's components.

v1 paths are under `C:\Users\USER\Desktop\DocuHealth-\src\` (doctor: `Dashboard\Hospital_Dashboard\Hospital_Doctors\`,
`Components\Dashboard\Hospital_Dashboard_Components\Hospital_Doctors\`; nurse: the same with
`Hospital_Nurses`). Many v1 API paths are stale; the schema paths below are the ones to use.

## Build steps (one commit each)

1. **Shared base.** Doctor and nurse shells and login routing (`doctor` → `/hospital/doctor`,
   `nurse` → `/hospital/nurse`); shared pages (appointments, personnel, settings, messages, help);
   patient lists (admitted / outpatients / discharged, `GET /api/hospital-ops/patients?status=`);
   patient page shell (info from `GET /api/patients/{hin}/info`, visit timeline from
   `GET /api/records/check-ins|admissions/{sqid}/records`, discharged record from
   `GET /api/hospital-ops/discharged-patients`); staff, ward and bed pickers.
2. **Nurse front line.** Nursing encounter queue (reserve, assessment, send to doctor); overview with
   vitals requests (process them) and admitted patients; one vitals form shared by every screen.
3. **Doctor front line.** Doctor queue (claim, end encounter, check out, recent care activities);
   outpatient patient page (encounter notes, lab and scan results, medication, visit records); SOAP
   note and additional notes; vitals request.
4. **Doctor orders.** Lab, scan and drug orders with their pickers; admission request (ward → bed),
   transfer, referral.
5. **Inpatient care.** Doctor care tasks (7 types) and task history; the nurse's per-admission task
   queue (claim, execute forms, confirm medication, release, missed, escalate) and charts; Tasks page.
6. **Notes.** Admission note (and its gate on new admissions), case notes, care plans, record vitals
   and vitals history, progress notes, shared SOAP notes, doctor and nurse handovers (and history pages).
7. **Discharge, results, overviews.** Doctor discharge form (2 steps), nurse discharge checklist,
   discharge summaries; doctor result review (lab and scan approve / reject); doctor overview;
   nurse appointment assign.

Not built (no backend): Messages; v1's "Quick log" (did nothing).

## Doctor (v1)

Sidebar: Overview, Doctor Encounter, Handover Note History, Appointments, Scan/Lab Results, Patient
Mgt., Messages, Health Personnel, Settings. v1 has no per-patient URLs (state-driven views).

- **Doctor queue** — `GET /api/hospital-ops/check-ins/doctor-queue?status=doctor_idle|doctor_active|doctor_seen`
  (Pending / Active / Seen; polled). `DoctorCheckInQueue {sqid, status, patient_info, created_at,
escalated_at, closed_at, triage_priority, escalated_by, latest_vitals, claimed_by, reserved_by,
last_doctor_interaction}` (nested fields untyped). Pending → "Open patient's wall" (vitals, triage
  notes) → `POST /check-ins/{sqid}/claim` → patient page. Active (mine) → `POST …/end-encounter`.
  Seen → Resume (claim) or Check out `POST …/close`. Recent care activities:
  `GET /api/records/patients/{hin}/events` (`ClinicalEvent`), detail `GET /api/records/events/{sqid}`.
  Only the doctor who claimed a check-in may write notes or orders on it.
- **Patient page, outpatient** — tabs: info, encounter notes (SOAP list `GET /api/records/patients/{hin}/soap-notes`),
  radiology result, lab result, medication history, visit records. Actions: request admission, refer
  out, new encounter note.
- **Patient page, inpatient** — tabs: info, encounter notes, progress notes, admission note (nurse's),
  handover, task history, radiology, lab, medication, encounter records. Actions: refer out, transfer
  ward, discharge. "Other medical services" button: order lab / scan / pharmacy, drug task, vitals
  request; on an admission also vitals monitoring, procedure, fluid I/O, IV fluid, seizure events,
  glucose monitoring tasks.
- **SOAP note** — `POST /api/hospital-ops/soap-notes` (JSON; v1 used a stale multipart path). Step 1:
  `chief_complaint`_, `history_of_complain`, `past_med_history`, `family_history`, `social_history`,
  `other_history`, `review`, lists `drug_history_allergies[]`, `general_exam[]`, `systemic_exam[]`,
  `bedside_tests[]`, `investigations[]`. Step 2: `primary_diagnosis`_ (free text),
  `differential_diagnosis`, `problems_list[]`, `treatment_plan[]`, `care_instructions[]`*,
  `patient_education`, optional `next_appointment`, referral (`referred_docuhealhosp` — schema typo —
  / `referred_hosp`), `is_shared`. Plus `patient` (HIN), `check_in`, `vital_signs`. Check-ins only.
  Additional note: `POST /api/records/soap-note/additional-notes {soap_note, note}`.
- **Orders** (exactly one of `check_in` / `admission`):
  - Lab: `GET /api/lab/test-categories`, `GET /api/lab/lab-tests?category|search`;
    `POST /api/lab/test-orders/create {patient, items:[{test}], note, check_in|admission, ignore_duplicate_warning}`
    (400 `duplicate_warning` → confirm → resend with `true`).
  - Scan: `GET /api/radiology/scans?query=`; `POST /api/radiology/orders {patient, items:[{scan}], check_in|admission}`.
  - Drug: `GET /api/pharmacy/drugs/autocomplete?query=` (rxcui, name, strength, dose_form, route);
    `POST /api/pharmacy/orders/create {patient, check_in|admission, drugs:[{catalog_drug | manual_drug{name,route,strength?,dose_form?}, dosage{quantity,unit,frequency,duration{value,rate},allergies}}]}`.
  - Vitals request: `POST /api/records/vital-signs/requests {patient_hin, check_in, staff?, note?}`.
- **Admission request** — wards/beds, `POST /api/hospital-ops/admissions/requests/create {patient, bed, check_in}`
  (the receptionist accepts it). **Transfer** `POST /api/hospital-ops/admissions/transfer {admission, new_bed}`.
  **Referral** hospitals from `GET /api/auth/facilities/hospitals`;
  `POST /api/hospital-ops/referrals {check_in|admission, hospital_to_id, reason}`.
- **Care tasks** — `POST /api/inpatients/admissions/{sqid}/tasks`: `start_time`, `frequency`,
  `repeat_until` (duration|discharge), `duration{value, rate: hours|days|weeks|months}`, `priority`
  (low|medium|high|urgent), `instructions`, `task_type` + `config`: vital_signs `{}`; input_output
  `{tracking_mode}`; procedure `{procedure_name}`; glucose `{schedule}`; iv_fluid `{solution_type,
volume_per_bag, total_plan, infusion_rate, additives[]}`; seizure_event `{characteristics,
emergency_standing_order}`; medication `{drugs:[…]}` (also creates the pharmacy order). History
  `GET /api/inpatients/tasks/{admission_sqid}`.
- **Progress notes** — `POST /api/records/progress-notes {patient, admission, subjective, objective, assessments, plan}`;
  `GET /api/records/progress-notes/{hin}`.
- **Discharge (inpatient)** — `POST /api/hospital-ops/admissions/{sqid}/doctor-discharge-form`:
  `patient`, `chief_complaint`, `primary_diagnosis`, `secondary_diagnosis`, `comorbidities`,
  `treatment_plan`, `hospital_course_note`, `care_instructions`, `condition_at_discharge`,
  `continue_followup_at_curr_hospital`, `follow_up_clinic`, `follow_up_date`, `follow_up_time`,
  `follow_up_instructions`, `completed_investigations` / `pending_investigations`
  (`[{sqid, type:"lab_test_order"}]`), `discharge_medications[]`. The admission becomes
  `awaiting_nurse_discharge`; the nurse finishes it. Outpatient: end encounter, then close.
- **Result review** — lab: `GET /api/lab/doctor-test-order-items?status=` (better than v1's
  flattening), `PATCH /api/lab/test-orders/items/{item}/result/approve-by-doctor` /
  `reject-by-doctor {rejection_reason}`. Scan: `GET /api/radiology/results/pending`,
  `PATCH /api/radiology/results/{sqid}/accept` / `reject {rejection_reason}`.
- **Handover** — `POST /api/hospital-ops/handovers/doctor {to_doctor_id, patient_hin,
working_diagnosis, current_clinical_status, critical_events?, outstanding_investigations?,
pending_procedures?, pending_consult_reviews?, clinical_concerns?, management_plan?}`; history
  `GET` same path (split sent / received in the browser).
- **Overview** — v1 used dashboard metrics (`/api/hospital-ops/dashboards/doctor` has none in the
  schema): appointments, admissions, referrals, admitted / discharged charts.
- **Appointments** — the shared staff page; an appointment isn't a visit, so no orders from it.

## Nurse (v1)

Sidebar: Overview, Nursing Encounter, Handover Note History, Tasks, Patient Mgt., Messages, Health
Personnel, Appointments, Settings.

- **Overview** — vitals requests `GET /api/records/vital-signs/requests/pending`; process
  `POST /api/records/vital-signs/requests/{sqid}/process` (`VitalSignsWrite`: blood_pressure, temp,
  resp_rate, heart_rate, height, weight, spo2, pain_score, notes; no `bmi`); admitted patients
  `GET /api/hospital-ops/admissions?search&ward` (`WardAdmissionRead`).
- **Nursing encounter queue** — `GET /api/hospital-ops/check-ins/nurse-queue?status=pending|closed|sent_to_doctor`
  (polled). Reserve `POST /check-ins/{sqid}/reserve`; assessment
  `POST /check-ins/{sqid}/nursing-assessment {triage_priority: routine|urgent|emergency, notes, vital_signs, escalate}`
  (`escalate: true` sends to the doctor, else closes).
- **Patient page** — info; nursing tasks / in progress / history; shared SOAP notes
  (`GET /api/records/patients/{hin}/soap-notes/shared`); encounter records; care plans; admission
  notes; latest vitals and ongoing drugs. Actions: case notes, vitals history, update vitals,
  handover, add admission note (required before working on a new admission).
- **Task queue** — `GET /api/inpatients/admissions/{sqid}/task-occurrences` (`status` filter not in
  the schema); claim / release / mark-missed / escalate `{escalation_reason}` /
  confirm-medication / execute `POST /api/inpatients/task-occurrences/{sqid}/…`. Execute bodies
  (from v1 only; undocumented): vital_signs (parameters from `summary.parameters`); glucose
  `{value, unit: mg_dl|mmol_l, context: fasting|pre_meal|post_meal|bedtime|random, insulin_administered}`;
  procedure `{consent, post_procedure_status, estimated_blood_volume_ml, current_position}`;
  iv_fluid `{add_to_patient_fluid_chart, site_condition, cannula_location, nursing_remark}`;
  seizure_event `{duration_minutes, duration_seconds, physical_signs, body_parts_involved,
level_of_consciousness, patient_reaction, interventions_administered}`; input_output
  `{intake{…}, output{…}}` by `summary.tracking_mode`; nurse_in_patient_discharge → the discharge
  checklist. Charts `GET /api/records/admissions/{sqid}/charts/{vital-signs|medications|glucose|fluid-balance|seizures|procedures|iv-fluids}`,
  fluid balance `GET /api/records/admissions/{sqid}/fluid-balance`.
- **Tasks page** — `GET /api/inpatients/task-occurrences` (pending only per the schema; `timing`,
  `priority` filters). Rows carry no admission.
- **Notes** — admission note `POST /api/records/admissions/{sqid}/admission-note {vital_signs,
allergies[], mobility_assessment, nutritional_assessment, fall_risk_assessment, skin_assessment,
initial_nursing_concern, intake?, output?}`, list `GET /api/records/patients/{hin}/admission-notes`;
  case notes `POST /api/records/case-notes {patient, admission, observation[], care[], response[],
abnormalities[], follow_up[]}`, list `GET /api/records/patients/{hin}/case-notes`; care plans
  `POST /api/records/care-plans {patient, admission, problem, goals, intervention, evaluation}`,
  list `GET /api/records/patients/{hin}/care-plans`; vitals `POST|GET /api/records/patients/{hin}/vital-signs`.
- **Handover** — `POST /api/hospital-ops/handovers/nurse {to_nurse_id, patient_hin,
general_patient_condition, significant_events, medications_due, outstanding_nursing_tasks,
pending_investigations, escalations, recommendations}`; history `GET …/handovers/nurse/received|sent`.
- **Discharge checklist** — the `nurse_in_patient_discharge` occurrence's execute: `final_vital_signs`,
  booleans (`peripheral_iv_cannula_removed`, `surgical_dressing_clean`, `urinary_catheter_removed`,
  `surgical_drains_removed`, `valuables_handed`, `reviewed_discharge_meds`, `warning_signs_explained`,
  `medication_explained`, `will_continue_followup`), `condition_on_discharge` (stable|critical|deceased),
  `accompanied_by` (relative|solo|escort), `mobility_status` (mobile|assisted|bedridden),
  `iv_sites_status`, `wound_status`, `education_given`, `follow_up_instructions`, `admission_id`,
  `patient`. Frees the bed and discharges.
- **Appointments** — the shared staff page plus "Assign to doctor":
  `PATCH /api/hospital-ops/appointments/{sqid}/assign {note, type, doctor_id, scheduled_time}`.

## Known API gaps (go in the gaps file as each step lands)

Untyped nested queue fields (`claimed_by`, `reserved_by`, `latest_vitals`…); no response schema for
`/hospital-ops/patients`, dashboards, charts, events; task lists can't filter by status and task rows
carry no admission; execute bodies undocumented; no per-admission discharge summary route; no
per-patient scan results; handovers not filterable per patient; SOAP note file upload unclear
(JSON-only); `VitalSignsWrite` has no `bmi`; staff `role` / `search` filters undocumented.
