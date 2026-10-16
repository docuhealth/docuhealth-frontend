import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { Clock, Paperclip, AlertCircle, RefreshCw } from "lucide-react";
import { fetchEncounterRecords } from "../../queries/Hospital/encounterRecords";

// Record type definitions and filter groups
const TYPES = {
  vital_signs: { label: "Vitals", chip: "bg-teal-50 text-teal-700", group: "vitals" },
  nursing_assessment: { label: "Nursing Assessment", chip: "bg-green-50 text-green-700", group: "vitals" },
  soap_note: { label: "Encounter note", chip: "bg-blue-50 text-blue-700", group: "soap" },
  progress_note: { label: "Progress Note", chip: "bg-green-50 text-green-700", group: "soap" },
  lab_test_result: { label: "Lab result", chip: "bg-amber-50 text-amber-700", group: "labs" },
  scan_result: { label: "Radiology result", chip: "bg-violet-50 text-violet-700", group: "radiology" },
  drug_record: { label: "Medication", chip: "bg-rose-50 text-rose-700", group: "medication" },
  admission_note: { label: "Admission Note", chip: "bg-docuhealth-blue-bright text-white", group: "others" },
  care_plan: { label: "Care Plan", chip: "bg-sky-50 text-sky-800", group: "others" },
  case_note: { label: "Case Note", chip: "bg-orange-50 text-amber-800", group: "others" },
  input_record: { label: "Fluid intake", chip: "bg-cyan-50 text-cyan-800", group: "others" },
  output_record: { label: "Fluid output", chip: "bg-cyan-50 text-cyan-800", group: "others" },
  glucose_record: { label: "Blood glucose", chip: "bg-lime-50 text-lime-800", group: "others" },
  iv_fluid_record: { label: "IV fluid", chip: "bg-cyan-50 text-cyan-800", group: "others" },
  procedure_record: { label: "Procedure", chip: "bg-indigo-50 text-indigo-700", group: "others" },
  seizure_event_log: { label: "Seizure event", chip: "bg-red-50 text-red-700", group: "others" },
  doctor_discharge_form: { label: "Doctor's discharge", chip: "bg-gray-900 text-white", group: "others" },
  nurse_discharge_form: { label: "Nurse's discharge", chip: "bg-gray-900 text-white", group: "others" },
};
const FALLBACK_TYPE = { label: "Record", chip: "bg-gray-100 text-gray-700", group: "others" };
const typeOf = (t) => TYPES[t] || { ...FALLBACK_TYPE, label: humanize(t) };

const DOT_STYLES = {
  admission_note: "bg-docuhealth-blue-bright border-docuhealth-blue-bright",
  doctor_discharge_form: "bg-gray-900 border-gray-900",
  nurse_discharge_form: "bg-gray-900 border-gray-900",
};

const FILTERS = [
  ["all", "All"],
  ["soap", "Encounter notes"],
  ["vitals", "Vitals"],
  ["labs", "Labs"],
  ["radiology", "Radiology"],
  ["medication", "Medication"],
  ["others", "Others"],
];

const ROLE_COLORS = {
  doctor: "bg-amber-500",
  nurse: "bg-fuchsia-500",
  receptionist: "bg-blue-500",
  lab_scientist: "bg-amber-700",
  radiologist: "bg-green-500",
  pharmacist: "bg-rose-500",
};

const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (d) => (d ? `${pad(new Date(d).getHours())}:${pad(new Date(d).getMinutes())}` : "");
const fmtDate = (d, opts) => (d ? new Date(d).toLocaleDateString("en-GB", opts) : "N/A");
const fmtDateTime = (d) => (d ? `${fmtDate(d, { day: "numeric", month: "short", year: "numeric" })}, ${fmtTime(d)}` : "N/A");
const fmtDay = (d) => fmtDate(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).replace(",", "");

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
function humanize(v) {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return titleCase(String(v).replace(/_/g, " "));
}
const joinList = (v) => (Array.isArray(v) ? v.filter(Boolean).join("; ") : v || "");
const staffName = (s) => (s ? `${s.role === "doctor" ? "Dr. " : ""}${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() : "");
const initials = (s) => `${s?.firstname?.[0] ?? ""}${s?.lastname?.[0] ?? ""}`.toUpperCase() || "?";
const rate = (x) => (x && typeof x === "object" ? `${x.value ?? ""} ${x.rate ?? ""}`.trim() : x || "");
const isHighBp = (bp) => {
  const [sys, dia] = String(bp || "").split("/").map(Number);
  return sys >= 140 || dia >= 90;
};

const StaffTag = ({ staff }) => {
  if (!staff) return null;
  return (
    <div className="flex items-center gap-2 shrink-0 text-[13px]">
      <span className={`w-6 h-6 rounded-full ${ROLE_COLORS[staff.role] || "bg-gray-400"} text-white text-[9px] font-semibold flex items-center justify-center`}>
        {initials(staff)}
      </span>
      <span className="font-medium text-gray-900">{staffName(staff)}</span>
      <span className="text-gray-400 hidden sm:inline">· {humanize(staff.role)}</span>
    </div>
  );
};

const TypeChip = ({ type }) => (
  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${typeOf(type).chip}`}>
    {typeOf(type).label}
  </span>
);

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  done: "bg-green-50 text-green-700 font-medium",
};
const StatusTag = ({ children, tone }) => (
  <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${STATUS_STYLES[tone] || "text-gray-600 bg-gray-100"}`}>
    {children}
  </span>
);

const Body = ({ children, className = "" }) => (
  <div className={`mx-4 border-t border-gray-100 text-[13px] ${/\bpy-/.test(className) ? "" : "py-3"} ${className}`}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase mb-1.5">{children}</p>
);

const Fields = ({ items }) => {
  const shown = items.filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!shown.length) return null;
  return (
    <Body className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 py-4">
      {shown.map(([label, value, flag]) => (
        <div key={label} className="min-w-0">
          <Label>{label}</Label>
          <p className={`break-words ${flag ? "text-red-700 font-semibold" : "text-gray-900"}`}>{value}</p>
        </div>
      ))}
    </Body>
  );
};

const QuadBody = ({ cells }) => {
  const shown = cells.filter(([, text]) => text);
  if (!shown.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-100 mx-4">
      {shown.map(([label, text], i) => (
        <div
          key={label}
          className={`py-4 ${i % 2 === 0 ? "md:pr-6 md:border-r md:border-gray-100" : "md:pl-6"} ${
            i >= 2 ? "border-t border-gray-100" : i === 1 ? "border-t md:border-t-0 border-gray-100" : ""
          }`}
        >
          <Label>{label}</Label>
          <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-line">{text}</p>
        </div>
      ))}
    </div>
  );
};

const VitalsRow = ({ v }) => {
  if (!v) return null;
  const items = [
    ["BP", v.blood_pressure, isHighBp(v.blood_pressure)],
    ["HR", v.heart_rate],
    ["T", v.temp ? `${v.temp}°C` : null],
    ["RR", v.resp_rate],
    ["SpO₂", v.spo2 ? `${v.spo2}%` : null],
    ["Pain", v.pain_score],
    ["Wt", v.weight ? `${v.weight} kg` : null],
    ["Ht", v.height ? `${v.height} cm` : null],
  ].filter(([, val]) => val !== null && val !== undefined && val !== "");
  return (
    <div className="flex flex-wrap items-center gap-y-1 text-[13px]">
      {items.map(([label, val, high], i) => (
        <span key={label} className={`flex items-center pr-4 ${i ? "sm:border-l sm:border-gray-200 sm:pl-4" : ""}`}>
          <span className="text-gray-400 mr-1.5">{label}</span>
          <span className={high ? "text-red-600 font-semibold" : "text-gray-900"}>{val}</span>
        </span>
      ))}
    </div>
  );
};

const headline = (type, r) => {
  switch (type) {
    case "soap_note": return r.primary_diagnosis || "Consultation";
    case "progress_note": return "Progress note";
    case "drug_record": return [r.name, r.strength].filter(Boolean).join(" ");
    case "lab_test_result": return (r.parameters_info || []).map((p) => p.parameter_info?.name).filter(Boolean).join(", ") || "Lab result";
    case "scan_result": return r.clinical_indication || "Scan report";
    case "admission_note": return "Nursing admission note";
    case "care_plan": return r.problem || "Care plan";
    case "procedure_record": return r.procedure_name;
    case "input_record": return r.volume_ml ? `${Number(r.volume_ml)} ml in` : "";
    case "output_record": return r.volume_ml ? `${Number(r.volume_ml)} ml out` : "";
    case "glucose_record": return r.value != null ? `${r.value} ${r.unit === "mg_dl" ? "mg/dL" : r.unit === "mmol_l" ? "mmol/L" : humanize(r.unit)}` : "";
    case "iv_fluid_record": return humanize(r.solution_type);
    case "doctor_discharge_form": return r.primary_diagnosis ? `Diagnosis: ${r.primary_diagnosis}` : "Doctor's discharge form";
    case "nurse_discharge_form": return r.condition_on_discharge ? `Condition: ${humanize(r.condition_on_discharge)}` : "Nurse's discharge checks";
    default: return "";
  }
};

const fieldItems = (type, r) => {
  switch (type) {
    case "admission_note":
      return [
        ["Allergies", joinList(r.allergies) || "None recorded"],
        ["Mobility", r.mobility_assessment_label || humanize(r.mobility_assessment)],
        ["Nutrition", r.nutritional_assessment_label || humanize(r.nutritional_assessment)],
        ["Falls risk", r.fall_risk_assessment],
        ["Skin", r.skin_assessment],
        ["Initial concern", r.initial_nursing_concern],
      ];
    case "care_plan":
      return [["Goals", r.goals], ["Intervention", r.intervention], ["Evaluation", r.evaluation]];
    case "case_note":
      return [
        ["Observation", joinList(r.observation)], ["Care given", joinList(r.care)], ["Response", joinList(r.response)],
        ["Abnormalities", joinList(r.abnormalities), true], ["Follow-up", joinList(r.follow_up)],
      ];
    case "input_record":
      return [["Source", humanize(r.source)], ["Fluid / feed", humanize(r.fluid_feed)], ["Route", humanize(r.route)], ["Recorded for", r.recorded_at && fmtDateTime(r.recorded_at)]];
    case "output_record":
      return [["Type", humanize(r.output_type)], ["Characteristics", humanize(r.characteristics)], ["Remark", r.nursing_remark], ["Recorded for", r.recorded_at && fmtDateTime(r.recorded_at)]];
    case "glucose_record":
      return [["Context", humanize(r.context)], ["Insulin given", humanize(Boolean(r.insulin_administered))]];
    case "iv_fluid_record":
      return [
        ["Bag volume", r.volume_per_bag && `${r.volume_per_bag} ml`], ["Rate", r.infusion_rate && `${r.infusion_rate} ml/h`],
        ["Bags planned", r.total_plan], ["Site", humanize(r.site_condition)], ["Cannula", humanize(r.cannula_location)],
        ["Additives", joinList((r.additives || []).map(humanize))], ["Remark", r.nursing_remark],
      ];
    case "procedure_record":
      return [
        ["Consent", humanize(r.consent)], ["After procedure", humanize(r.post_procedure_status)],
        ["Blood loss", r.estimated_blood_volume_ml != null ? `${r.estimated_blood_volume_ml} ml` : null],
        ["Position", humanize(r.current_position)], ["Instruction", r.instruction],
      ];
    case "seizure_event_log":
      return [
        ["Duration", `${r.duration_minutes ?? 0}m ${r.duration_seconds ?? 0}s`], ["Movement", humanize(r.motor_movement)],
        ["Signs", humanize(r.physical_signs)], ["Body parts", humanize(r.body_parts_involved)],
        ["Consciousness", humanize(r.level_of_consciousness)], ["Afterwards", humanize(r.patient_reaction)],
        ["Interventions", r.interventions_administered],
      ];
    case "doctor_discharge_form":
      return [
        ["Chief complaint", r.chief_complaint], ["Primary diagnosis", r.primary_diagnosis],
        ["Secondary diagnosis", r.secondary_diagnosis], ["Comorbidities", r.comorbidities],
        ["Hospital course", r.hospital_course_note], ["Treatment plan", r.treatment_plan],
        ["Care instructions", r.care_instructions], ["Condition at discharge", humanize(r.condition_at_discharge)],
        ["Follow-up clinic", r.follow_up_clinic],
        ["Follow-up date", r.follow_up_date && `${fmtDate(r.follow_up_date, { day: "numeric", month: "short", year: "numeric" })}${r.follow_up_time ? `, ${r.follow_up_time.slice(0, 5)}` : ""}`],
        ["Follow-up instructions", r.follow_up_instructions],
      ];
    case "nurse_discharge_form":
      return [
        ["Condition", humanize(r.condition_on_discharge)], ["Mobility", humanize(r.mobility_status)],
        ["Accompanied by", humanize(r.accompanied_by)], ["Valuables returned", humanize(Boolean(r.valuables_handed))],
        ["IV sites", humanize(r.iv_sites_status)], ["Wound", humanize(r.wound_status)],
        ["Education given", r.education_given], ["Follow-up instructions", r.follow_up_instructions],
      ];
    default:
      return null;
  }
};

const soapCells = (r) => [
  ["Subjective", [r.chief_complaint, r.history_of_complain].filter(Boolean).join(". ")],
  ["Objective", [joinList(r.general_exam), joinList(r.systemic_exam), joinList(r.bedside_tests)].filter(Boolean).join(". ")],
  ["Assessment", [r.primary_diagnosis, r.differential_diagnosis && `Differential: ${r.differential_diagnosis}`].filter(Boolean).join(". ")],
  ["Plan", [joinList(r.treatment_plan), joinList(r.care_instructions)].filter(Boolean).join(". ")],
];

const RecordBody = ({ type, r }) => {
  switch (type) {
    case "soap_note":
      return <QuadBody cells={soapCells(r)} />;
    case "progress_note":
      return <QuadBody cells={[["Subjective", r.subjective], ["Objective", r.objective], ["Assessment", r.assessments], ["Plan", r.plan]]} />;
    case "nursing_assessment":
      return (
        <Body className="space-y-2">
          <VitalsRow v={r.vital_signs_info} />
          {r.notes && <p className="text-gray-800">{r.notes}</p>}
        </Body>
      );
    case "drug_record":
      return (
        <Body className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
          <p className="text-gray-700">{[r.quantity && `${Number(r.quantity)} ${r.unit || ""}`.trim(), r.route].filter(Boolean).join(" · ")}</p>
          <p className="text-gray-400">{[rate(r.frequency), rate(r.duration)].filter(Boolean).join(" · ")}</p>
        </Body>
      );
    case "lab_test_result":
      return (
        <Body className="py-0">
          {(r.parameters_info || []).map((p, i) => {
            const pi = p.parameter_info || {};
            const n = Number(p.value);
            const out = !Number.isNaN(n) && ((pi.ref_low != null && n < pi.ref_low) || (pi.ref_high != null && n > pi.ref_high));
            return (
              <div key={pi.sqid || i} className="flex justify-between gap-4 py-2.5 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-800">{pi.name}{pi.ref_text && <span className="text-gray-400"> · ref {pi.ref_text}</span>}</span>
                <span className={`text-right ${out ? "text-red-600 font-semibold" : "text-gray-800"}`}>{p.value} {pi.unit}</span>
              </div>
            );
          })}
          {(r.interpretation || r.comments) && (
            <p className="text-gray-700 py-2.5 border-t border-gray-100">{[r.interpretation, r.comments].filter(Boolean).join(". ")}</p>
          )}
        </Body>
      );
    case "scan_result":
      return (
        <Body className="space-y-2">
          {joinList(r.findings) && <p className="text-gray-800"><span className="font-semibold text-gray-900">Findings:</span> {joinList(r.findings)}</p>}
          {joinList(r.impression) && <p className="text-gray-800"><span className="font-semibold text-gray-900">Impression:</span> {joinList(r.impression)}</p>}
          {joinList(r.recommendation) && <p className="text-gray-800"><span className="font-semibold text-gray-900">Recommendation:</span> {joinList(r.recommendation)}</p>}
          {r.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 print:hidden pt-1">
              {r.attachments.map((a) => (
                <a key={a.id || a.url} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-docuhealth-primary hover:underline">
                  <Paperclip className="w-3 h-3" /> {a.filename || "Attachment"}
                </a>
              ))}
            </div>
          )}
          {r.reporter_name && <p className="text-gray-400 text-xs mt-1">Reported by {r.reporter_name}{r.reporter_specialty ? `, ${r.reporter_specialty}` : ""}</p>}
        </Body>
      );
    case "admission_note":
    case "care_plan":
    case "case_note":
    case "input_record":
    case "output_record":
    case "glucose_record":
    case "iv_fluid_record":
    case "procedure_record":
    case "seizure_event_log":
    case "doctor_discharge_form":
    case "nurse_discharge_form":
      return <Fields items={fieldItems(type, r)} />;
    default:
      return null;
  }
};

const RecordCard = ({ entry }) => {
  const { record_type: type, record: r, action, staff_info: staff } = entry;

  if (!r) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <TypeChip type={type} />
          <span className="text-[13px] text-gray-400 italic">This record is no longer available.</span>
        </div>
        <StaffTag staff={staff} />
      </div>
    );
  }

  if (type === "vital_signs") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <TypeChip type={type} />
          <VitalsRow v={r} />
          {action === "task_completed" && <StatusTag tone="done">From task</StatusTag>}
        </div>
        <StaffTag staff={staff} />
      </div>
    );
  }

  const title = headline(type, r);
  const status = r.status && ["lab_test_result", "scan_result"].includes(type) ? r.status : null;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <TypeChip type={type} />
          {title && <span className="text-[13px] font-semibold text-gray-900">{title}</span>}
          {type === "nursing_assessment" && r.triage_priority && <StatusTag>{humanize(r.triage_priority)} priority</StatusTag>}
          {status && <StatusTag tone={status}>{humanize(status)}</StatusTag>}
          {action === "task_completed" && <StatusTag tone="done">From task</StatusTag>}
        </div>
        <StaffTag staff={staff} />
      </div>
      <RecordBody type={type} r={r} />
    </>
  );
};

const SkeletonCard = ({ h = "h-16" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl ${h} animate-pulse`} />
);

/**
 * EncounterRecordsTimeline
 * Chronological care timeline using GET /api/records/check-ins/<sqid>/records or GET /api/records/admissions/<sqid>/records.
 * Supports both open (active) and discharged encounters.
 */
const EncounterRecordsTimeline = ({
  kind = "admission", // "admission" | "check_in"
  sqid,
  isOngoing = true,
  showHeader = true,
  title = "Care Record",
}) => {
  const [filter, setFilter] = useState("all");

  const normalizedKind = kind === "check-in" || kind === "check_in" ? "check_in" : "admission";

  const {
    data: entries = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["encounter-records", normalizedKind, sqid],
    queryFn: () => fetchEncounterRecords({ kind: normalizedKind, sqid }),
    enabled: !!sqid,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const counts = useMemo(() => {
    const c = { all: entries.length };
    entries.forEach((e) => {
      const g = typeOf(e.record_type).group;
      c[g] = (c[g] || 0) + 1;
    });
    return c;
  }, [entries]);

  const entriesFor = (f) => entries.filter((e) => f === "all" || typeOf(e.record_type).group === f);

  const groupByDay = (list) =>
    list.reduce((acc, e) => {
      const day = fmtDay(e.created_at);
      (acc[day] ||= []).push(e);
      return acc;
    }, {});

  const errorText =
    error?.response?.status === 403
      ? "Only doctors and nurses can view this record."
      : error?.response?.status === 404
      ? "This visit or stay could not be found at your hospital."
      : "Could not load the care record.";

  const isOut = normalizedKind === "check_in";
  const shown = entriesFor(filter);

  if (!sqid) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl py-12 px-4 text-center">
        <p className="text-gray-500 text-sm">No encounter reference available to load records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm text-gray-800">
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              {isOngoing ? (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active encounter
                </span>
              ) : (
                <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  Discharged
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading
                ? "Loading care records..."
                : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} recorded · oldest first`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh timeline"
              className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-700 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-docuhealth-primary" : ""}`} />
            </button>

            {/* Filter Chips */}
            <div className="flex items-center overflow-x-auto bg-white border border-gray-200 rounded-lg p-1">
              {FILTERS.map(([key, label], i) => (
                <React.Fragment key={key}>
                  {i > 0 && (
                    <span
                      className={`w-px h-[16px] shrink-0 ${
                        filter !== key && filter !== FILTERS[i - 1][0] ? "bg-gray-200" : "bg-transparent"
                      }`}
                    />
                  )}
                  <button
                    onClick={() => setFilter(key)}
                    className={`px-3 py-1 mx-0.5 rounded-md text-xs whitespace-nowrap cursor-pointer transition-colors ${
                      filter === key
                        ? "bg-docuhealth-primary text-white font-medium"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {label} ({counts[key] || 0})
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content states */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard h="h-28" />
          <SkeletonCard />
          <SkeletonCard h="h-24" />
        </div>
      ) : isError ? (
        <div className="bg-white border border-red-200 rounded-xl py-10 px-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-700 font-medium">{errorText}</p>
          {![403, 404].includes(error?.response?.status) && (
            <button
              onClick={() => refetch()}
              className="mt-3 px-5 py-1.5 rounded-full border border-docuhealth-primary text-docuhealth-primary text-xs font-medium cursor-pointer hover:bg-blue-50"
            >
              Try again
            </button>
          )}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-12 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-gray-700 font-medium text-sm">Nothing recorded yet for this {isOut ? "visit" : "stay"}.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Vitals, notes, lab and scan results, care plans, and medication entries will automatically appear here as they are logged.
          </p>
        </div>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-10 text-center text-gray-500 text-xs">
          No entries found under the &quot;{FILTERS.find(([k]) => k === filter)?.[1]}&quot; category for this {isOut ? "visit" : "stay"}.
        </div>
      ) : (
        Object.entries(groupByDay(shown)).map(([day, list]) => (
          <div key={day} className="pt-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-[12px] font-semibold text-gray-700 bg-gray-50 px-3 py-0.5 rounded-full border border-gray-200">
                {day}
              </span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <ol>
              {list.map((entry, i) => {
                const last = i === list.length - 1;
                return (
                  <li key={entry.sqid} className="flex gap-2 sm:gap-3">
                    <span className="w-10 sm:w-12 shrink-0 pt-3.5 text-xs text-gray-500 tabular-nums">
                      {fmtTime(entry.created_at)}
                    </span>
                    <div className="relative flex flex-col items-center w-3 shrink-0">
                      <span
                        className={`mt-4 w-3 h-3 rounded-full border-2 z-10 ${
                          DOT_STYLES[entry.record_type] || "bg-white border-gray-400"
                        }`}
                      />
                      {!last && <span className="absolute top-4 bottom-0 w-px bg-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="bg-white border border-gray-200 rounded-xl hover:shadow-xs transition-shadow">
                        <RecordCard entry={entry} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))
      )}
    </div>
  );
};

EncounterRecordsTimeline.propTypes = {
  kind: PropTypes.oneOf(["admission", "check_in", "check-in"]),
  sqid: PropTypes.string,
  isOngoing: PropTypes.bool,
  showHeader: PropTypes.bool,
  title: PropTypes.string,
};

export default EncounterRecordsTimeline;
