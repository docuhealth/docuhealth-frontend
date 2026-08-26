/**
 * Shared value/label option lists for anything that submits against the
 * backend's inpatient-care-task enums: drug dosages (MedicationSection,
 * used by the pharmacy order + discharge medication forms) and inpatient
 * care tasks (TaskCreationModal and its callers) both submit against the
 * same FrequencyEnum/PriorityEnum, so keep one source of truth instead of
 * hand-copying value/label pairs into every form that needs them — that's
 * how the old `od_qd`/`bd_bid`/`tds_tid` codes went stale in one place
 * after the backend renamed them everywhere else.
 */
export const FREQUENCY_OPTIONS = [
  { value: "stat", label: "stat - Immediately" },
  { value: "once", label: "once - One-time dose" },
  { value: "od", label: "od - Once daily" },
  { value: "bd", label: "bd - Twice daily" },
  { value: "tds", label: "tds - Three times daily" },
  { value: "qid", label: "qid - Four times daily" },
  { value: "q1h", label: "q1h - Every hour" },
  { value: "q2h", label: "q2h - Every 2 hours" },
  { value: "q3h", label: "q3h - Every 3 hours" },
  { value: "q4h", label: "q4h - Every 4 hours" },
  { value: "q6h", label: "q6h - Every 6 hours" },
  { value: "q8h", label: "q8h - Every 8 hours" },
  { value: "q12h", label: "q12h - Every 12 hours" },
  { value: "q24h", label: "q24h - Every 24 hours" },
  { value: "prn", label: "prn - As needed" },
  { value: "mane", label: "mane - Morning" },
  { value: "nocte", label: "nocte - Night" },
  { value: "alt_days", label: "alt_days - Alternate days" },
  { value: "weekly", label: "weekly - Weekly" },
  { value: "monthly", label: "monthly - Monthly" },
];
export const DEFAULT_FREQUENCY = "od";

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low priority task" },
  { value: "medium", label: "Medium priority task" },
  { value: "high", label: "High priority task" },
  { value: "urgent", label: "Urgent priority task" },
];
export const DEFAULT_PRIORITY = "medium";

export const DURATION_RATE_OPTIONS = [
  { value: "hours", label: "Hour(s)" },
  { value: "days", label: "Day(s)" },
  { value: "weeks", label: "Week(s)" },
  { value: "months", label: "Month(s)" },
];
export const DEFAULT_DURATION_RATE = "hours";

export const REPEAT_UNTIL_OPTIONS = [
  { value: "duration", label: "Run for a set duration" },
  { value: "discharge", label: "Run until discharge" },
];
export const DEFAULT_REPEAT_UNTIL = "duration";
