# Frontend Handoff — Admission Charts for Nurses

## Summary

A new endpoint lets nurses view clinical charts (vital signs, medications, glucose, procedures, IV fluids, seizures, fluid balance) for an admitted patient. Records are pulled from the admission's history — including records created during task execution. The response is paginated.

---

## New Endpoint

**`GET /api/nurses/admissions/{admission_sqid}/charts/{chart_type}`**

Nurse auth required. Only works on active admissions — discharged admissions return 400.

**Valid `chart_type` values:**

| Value | Returns |
|-------|---------|
| `vital-signs` | Vital signs records |
| `medications` | Drug records |
| `glucose` | Glucose readings |
| `procedures` | Procedure records |
| `iv-fluids` | IV fluid records |
| `seizures` | Seizure event logs |
| `fluid-balance` | Grouped intake/output pairs |

Invalid chart types return 400.

---

## Pagination

Uses the default pagination (10 items per page). Override with `?page=N&size=N`.

**Response shape:**
```
{
  count: <total>,
  next: <url | null>,
  previous: <url | null>,
  results: [ ... ]
}
```

---

## Response Shapes by Chart Type

**vital-signs** — each item:
```
{
  sqid, blood_pressure, temp, resp_rate, height, weight,
  heart_rate, spo2, pain_score, notes, bmi,
  patient_info: { sqid, full_name, ... },
  staff_info: { sqid, full_name, ... },
  created_at, hospital
}
```
`bmi` is computed (not stored) — null if weight or height is missing.

**medications** — each item:
```
{
  sqid, name, route, quantity, unit,
  frequency: { value, rate },
  duration: { value, rate },
  patient_info, staff_info,
  created_at, hospital, status
}
```

**glucose** — each item:
```
{
  sqid, value, unit, context, insulin_administered,
  patient_info, staff_info,
  created_at, hospital
}
```

**procedures** — each item:
```
{
  sqid, procedure_name, instruction, consent,
  post_procedure_status, estimated_blood_volume_ml, current_position,
  patient_info, staff_info,
  created_at, hospital
}
```

**iv-fluids** — each item:
```
{
  sqid, additives, solution_type, volume_per_bag, total_plan, infusion_rate,
  add_to_patient_fluid_chart, site_condition, cannula_location, nursing_remark,
  patient_info, staff_info,
  created_at, hospital
}
```

**seizures** — each item:
```
{
  sqid, duration_minutes, duration_seconds, motor_movement, physical_signs,
  body_parts_involved, level_of_consciousness, patient_reaction,
  interventions_administered, is_prolonged_or_critical,
  patient_info, staff_info,
  created_at, hospital
}
```
`is_prolonged_or_critical` is computed — true if duration > 5 minutes or patient did not regain consciousness.

**fluid-balance** — each item:
```
{
  recorded_at,
  intake: { source, fluid_feed, route, volume_ml, recorded_at } | null,
  output: { output_type, characteristics, volume_ml, recorded_at, nursing_remark } | null
}
```
Intake and output are paired when they come from the same clinical event. Either can be null if only one was recorded.

