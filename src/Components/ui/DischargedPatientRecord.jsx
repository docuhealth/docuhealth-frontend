import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp, Clock, Download, Lock, Paperclip, User } from "lucide-react";
import {
  fetchEncounterRecords,
  fetchPatientDischargedEncounters,
  fetchPatientInfo,
} from "../../queries/Hospital/encounterRecords";

// One entry per backend record_type; `group` drives the filter chips
const TYPES = {
  vital_signs: { label: "Vitals", chip: "bg-teal-50 text-teal-700", group: "vitals" },
  nursing_assessment: { label: "Nursing Assessment", chip: "bg-green-50 text-green-700", group: "vitals" },
  soap_note: { label: "SOAP note", chip: "bg-blue-50 text-blue-700", group: "soap" },
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

// Milestones get a filled dot on the timeline
const DOT_STYLES = {
  admission_note: "bg-docuhealth-blue-bright border-docuhealth-blue-bright",
  doctor_discharge_form: "bg-gray-900 border-gray-900",
  nurse_discharge_form: "bg-gray-900 border-gray-900",
};

const FILTERS = [
  ["all", "All"],
  ["soap", "SOAP"],
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
const fmtRange = (a, b) => {
  const s = new Date(a), e = new Date(b || a);
  const end = fmtDate(e, { day: "numeric", month: "short", year: "numeric" });
  if (s.getFullYear() !== e.getFullYear()) return `${fmtDate(s, { day: "numeric", month: "short", year: "numeric" })}–${end}`;
  if (s.getMonth() !== e.getMonth()) return `${fmtDate(s, { day: "numeric", month: "short" })}–${end}`;
  return s.getDate() === e.getDate() ? end : `${s.getDate()}–${end}`;
};
const maskHin = (hin) => (hin && hin.length > 5 ? `${hin.slice(0, 5)}••••••` : hin || "N/A");
const ageFrom = (dob) => (dob ? Math.floor((Date.now() - new Date(dob)) / 31557600000) : null);
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
  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${typeOf(type).chip}`}>{typeOf(type).label}</span>
);

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  done: "bg-green-50 text-green-700 font-medium",
};
const StatusTag = ({ children, tone }) => (
  <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${STATUS_STYLES[tone] || "text-gray-600 bg-gray-100"}`}>{children}</span>
);

const Body = ({ children, className = "" }) => (
  <div className={`mx-4 border-t border-gray-100 text-[13px] ${/\bpy-/.test(className) ? "" : "py-3"} ${className}`}>{children}</div>
);

const Label = ({ children }) => (
  <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase mb-1.5">{children}</p>
);

// Label/value grid for structured nursing records; empty values are skipped
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

// SOAP-style 2x2 grid, used for SOAP and progress notes
const QuadBody = ({ cells }) => {
  const shown = cells.filter(([, text]) => text);
  if (!shown.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-100 mx-4">
      {shown.map(([label, text], i) => (
        <div key={label} className={`py-4 ${i % 2 === 0 ? "md:pr-6 md:border-r md:border-gray-100" : "md:pl-6"} ${i >= 2 ? "border-t border-gray-100" : i === 1 ? "border-t md:border-t-0 border-gray-100" : ""}`}>
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
    ["BP", v.blood_pressure, isHighBp(v.blood_pressure)], ["HR", v.heart_rate], ["T", v.temp ? `${v.temp}°C` : null],
    ["RR", v.resp_rate], ["SpO₂", v.spo2 ? `${v.spo2}%` : null], ["Pain", v.pain_score],
    ["Wt", v.weight ? `${v.weight} kg` : null], ["Ht", v.height ? `${v.height} cm` : null],
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

// Label/value pairs per record type, shared by the on-screen cards and the PDF
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

const dischargeChecklist = (r) => [
  ["IV cannula removed", r.peripheral_iv_cannula_removed], ["Urinary catheter removed / N/A", r.urinary_catheter_removed],
  ["Surgical drains removed / N/A", r.surgical_drains_removed], ["Surgical dressing clean", r.surgical_dressing_clean],
  ["Discharge meds reviewed", r.reviewed_discharge_meds], ["Warning signs explained", r.warning_signs_explained],
  ["Medication explained", r.medication_explained],
];

const vitalsText = (v) => (v ? [
  v.blood_pressure && `BP ${v.blood_pressure}`, v.heart_rate && `HR ${v.heart_rate}`, v.temp && `T ${v.temp}°C`,
  v.resp_rate && `RR ${v.resp_rate}`, v.spo2 && `SpO₂ ${v.spo2}%`, v.pain_score != null && v.pain_score !== "" && `Pain ${v.pain_score}`,
  v.weight && `Wt ${v.weight} kg`, v.height && `Ht ${v.height} cm`,
].filter(Boolean).join("  ·  ") : "");

const soapCells = (r) => [
  ["Subjective", [r.chief_complaint, r.history_of_complain].filter(Boolean).join(". ")],
  ["Objective", [joinList(r.general_exam), joinList(r.systemic_exam), joinList(r.bedside_tests)].filter(Boolean).join(". ")],
  ["Assessment", [r.primary_diagnosis, r.differential_diagnosis && `Differential: ${r.differential_diagnosis}`].filter(Boolean).join(". ")],
  ["Plan", [joinList(r.treatment_plan), joinList(r.care_instructions)].filter(Boolean).join(". ")],
];

// Every record type flattened to label/value rows for the printed document
const printRows = (type, r) => {
  switch (type) {
    case "vital_signs": return [["Vitals", vitalsText(r)], ["Notes", r.notes]];
    case "nursing_assessment": return [["Triage priority", humanize(r.triage_priority)], ["Vitals", vitalsText(r.vital_signs_info)], ["Notes", r.notes]];
    case "soap_note": return soapCells(r);
    case "progress_note": return [["Subjective", r.subjective], ["Objective", r.objective], ["Assessment", r.assessments], ["Plan", r.plan]];
    case "drug_record":
      return [
        ["Dose", [r.quantity && `${Number(r.quantity)} ${r.unit || ""}`.trim(), r.route].filter(Boolean).join(" · ")],
        ["Frequency", rate(r.frequency)], ["Duration", rate(r.duration)], ["Status", humanize(r.status)],
      ];
    case "lab_test_result":
      return [
        ...(r.parameters_info || []).map((p) => [p.parameter_info?.name || "Result", `${p.value ?? ""} ${p.parameter_info?.unit || ""}`.trim() + (p.parameter_info?.ref_text ? `   (ref ${p.parameter_info.ref_text})` : "")]),
        ["Interpretation", r.interpretation], ["Comments", r.comments], ["Status", humanize(r.status)],
      ];
    case "scan_result":
      return [
        ["Indication", r.clinical_indication], ["Findings", joinList(r.findings)], ["Impression", joinList(r.impression)],
        ["Recommendation", joinList(r.recommendation)],
        ["Reported by", [r.reporter_name, r.reporter_specialty].filter(Boolean).join(", ")],
        ["Attachments", (r.attachments || []).map((a) => a.filename).filter(Boolean).join(", ")], ["Status", humanize(r.status)],
      ];
    case "nurse_discharge_form":
      return [
        ...fieldItems(type, r),
        ["Checklist", dischargeChecklist(r).map(([label, ok]) => `${ok ? "Yes" : "No"}: ${label}`).join("\n")],
        ["Final vitals", vitalsText(r.final_vital_signs_info)],
      ];
    default:
      return fieldItems(type, r) || [];
  }
};

const RecordBody = ({ type, r }) => {
  switch (type) {
    case "soap_note":
      return (
        <QuadBody cells={soapCells(r)} />
      );
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
              <div key={pi.sqid || i} className="flex justify-between gap-4 py-2.5 border-b border-gray-100">
                <span className="text-gray-800">{pi.name}{pi.ref_text && <span className="text-gray-400"> · ref {pi.ref_text}</span>}</span>
                <span className={`text-right ${out ? "text-red-600 font-semibold" : "text-gray-800"}`}>{p.value} {pi.unit}</span>
              </div>
            );
          })}
          {(r.interpretation || r.comments) && (
            <p className="text-gray-700 py-2.5">{[r.interpretation, r.comments].filter(Boolean).join(". ")}</p>
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
            <div className="flex flex-wrap gap-2 print:hidden">
              {r.attachments.map((a) => (
                <a key={a.id || a.url} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-docuhealth-primary hover:underline">
                  <Paperclip className="w-3 h-3" /> {a.filename || "Attachment"}
                </a>
              ))}
            </div>
          )}
          {r.reporter_name && <p className="text-gray-400">Reported by {r.reporter_name}{r.reporter_specialty ? `, ${r.reporter_specialty}` : ""}</p>}
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
      return <Fields items={fieldItems(type, r)} />;
    case "nurse_discharge_form":
      return (
        <>
          <Fields items={fieldItems(type, r)} />
          <Body>
            <Label>Checklist</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
              {dischargeChecklist(r).map(([label, ok]) => (
                <p key={label} className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${ok ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{ok ? "Yes" : "No"}</span>
                  <span className="text-gray-700">{label}</span>
                </p>
              ))}
            </div>
          </Body>
          {r.final_vital_signs_info && (
            <Body className="space-y-1.5">
              <Label>Final vitals</Label>
              <VitalsRow v={r.final_vital_signs_info} />
            </Body>
          )}
        </>
      );
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

const Dropdown = ({ trigger, children, align = "right" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div className={`absolute top-full mt-1.5 ${align === "right" ? "right-0" : "left-0"} min-w-full w-max max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-1 text-sm`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

const encounterLabel = ({ kind, row }) =>
  kind === "admission" ? `Stay, ${fmtRange(row.created_at, row.discharge_date)}` : `Visit, ${fmtDate(row.closed_at, { day: "numeric", month: "short", year: "numeric" })}`;

const buildSummary = (row, entries) => {
  const doc = row?.doctor_discharge_form;
  const nurse = row?.nurse_discharge_form;
  if (!doc && !nurse) return null;
  const meds = entries.filter((e) => e.record_type === "drug_record" && e.action === "discharge" && e.record);
  const followUp = doc && [
    doc.follow_up_clinic,
    doc.follow_up_date && `on ${fmtDate(doc.follow_up_date, { day: "numeric", month: "short", year: "numeric" })}${doc.follow_up_time ? ` at ${doc.follow_up_time.slice(0, 5)}` : ""}`,
  ].filter(Boolean).join(" ");
  return {
    author: doc?.discharged_by_info || nurse?.discharged_by_info,
    at: doc?.created_at || nurse?.created_at,
    items: [
      { label: "Diagnosis", value: [doc?.primary_diagnosis, doc?.secondary_diagnosis && doc.secondary_diagnosis !== "None" && `Secondary: ${doc.secondary_diagnosis}`].filter(Boolean).join(". ") },
      { label: "Condition at discharge", value: humanize(doc?.condition_at_discharge || nurse?.condition_on_discharge) },
      { label: "Follow-up", value: [followUp && `Review at ${followUp}.`, doc?.follow_up_instructions !== "None" && doc?.follow_up_instructions].filter(Boolean).join(" ") || (doc ? "No follow-up booked." : "") },
      { label: "Medication on discharge", value: meds.length ? meds.map((m) => [m.record.name, m.record.quantity && `${Number(m.record.quantity)} ${m.record.unit || ""}`.trim(), rate(m.record.frequency), rate(m.record.duration)].filter(Boolean).join(", ")).join(". ") : "None recorded" },
      { label: "Hospital course", value: doc?.hospital_course_note },
      { label: "Care instructions", value: doc?.care_instructions },
      { label: "Education given", value: nurse?.education_given },
      { label: "Final vitals", vitals: nurse?.final_vital_signs_info },
    ].filter((i) => i.value || i.vitals),
  };
};

// Only the print copy is printed: the app shell, scroll panels and dropdowns are hidden
const PRINT_CSS = `
@media screen { .dh-print-root { display: none; } }
@media print {
  @page { size: A4; margin: 12mm; }
  body > *:not(.dh-print-root) { display: none !important; }
  .dh-print-root { display: block; }
  .dh-print-root * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .dh-avoid-break { break-inside: avoid; page-break-inside: avoid; }
}`;

// Plain document layout for the PDF: fixed label/value columns, no badges or avatars
const PrintDocument = ({ name, facts, encounter, closedLine, summary, isOut, entries }) => {
  const th = { fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b7280", fontWeight: 600, textAlign: "left", verticalAlign: "top", padding: "5px 12px 5px 0" };
  const td = { color: "#111827", verticalAlign: "top", padding: "5px 0", whiteSpace: "pre-line", wordBreak: "break-word" };
  const section = { fontSize: 11, fontWeight: 700, color: "#111827", borderBottom: "1.5px solid #111827", padding: "0 0 4px", margin: "18px 0 6px" };
  const days = entries.reduce((acc, e) => {
    const day = fmtDay(e.created_at);
    (acc[day] ||= []).push(e);
    return acc;
  }, {});
  const pairs = [];
  for (let i = 0; i < facts.length; i += 2) pairs.push(facts.slice(i, i + 2));
  return (
    <div style={{ fontFamily: "inherit", fontSize: 10.5, lineHeight: 1.45, color: "#111827" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #111827", paddingBottom: 8 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Patient Record</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{name}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#374151" }}>
          <div style={{ fontWeight: 600 }}>{encounter}</div>
          <div>Downloaded {fmtDateTime(new Date())}</div>
        </div>
      </div>

      <div style={section}>Patient details</div>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup><col style={{ width: "17%" }} /><col style={{ width: "33%" }} /><col style={{ width: "17%" }} /><col style={{ width: "33%" }} /></colgroup>
        <tbody>
          {pairs.map((pair) => (
            <tr key={pair[0][0]}>
              {pair.map(([label, value]) => (
                <React.Fragment key={label}><th style={th}>{label}</th><td style={td}>{value}</td></React.Fragment>
              ))}
              {pair.length === 1 && <><th style={th} /><td style={td} /></>}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ margin: "6px 0 0", fontSize: 9.5, color: "#4b5563" }}>{closedLine}</p>

      {!isOut && (
        <>
          <div style={section}>
            Discharge summary
            {summary?.author && <span style={{ fontWeight: 400, color: "#4b5563" }}>{`  ·  ${staffName(summary.author)}${summary.at ? `, ${fmtDateTime(summary.at)}` : ""}`}</span>}
          </div>
          {summary ? (
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup><col style={{ width: "24%" }} /><col /></colgroup>
              <tbody>
                {summary.items.map((item) => (
                  <tr key={item.label} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={th}>{item.label}</th>
                    <td style={td}>{item.vitals ? vitalsText(item.vitals) : item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#4b5563" }}>No discharge summary was recorded for this stay.</p>
          )}
        </>
      )}

      <div style={section}>Care record <span style={{ fontWeight: 400, color: "#4b5563" }}>{`  ·  ${entries.length} ${entries.length === 1 ? "entry" : "entries"}, oldest first`}</span></div>
      {entries.length === 0 && <p style={{ color: "#4b5563" }}>Nothing was recorded for this {isOut ? "visit" : "stay"}.</p>}
      {Object.entries(days).map(([day, list]) => (
        <div key={day}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "3px 6px", margin: "10px 0 4px" }}>{day}</div>
          {list.map((entry) => {
            const r = entry.record;
            const rows = r ? printRows(entry.record_type, r).filter(([, v]) => v !== null && v !== undefined && v !== "") : [];
            const title = r ? headline(entry.record_type, r) : "";
            return (
              <table key={entry.sqid} className="dh-avoid-break" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", borderBottom: "1px solid #e5e7eb", marginBottom: 2 }}>
                <colgroup><col style={{ width: "9%" }} /><col style={{ width: "21%" }} /><col /></colgroup>
                <tbody>
                  <tr>
                    <td style={{ ...td, fontWeight: 600, paddingTop: 7 }}>{fmtTime(entry.created_at)}</td>
                    <td colSpan={2} style={{ ...td, paddingTop: 7 }}>
                      <span style={{ fontWeight: 700 }}>{typeOf(entry.record_type).label}</span>
                      {title && <span style={{ fontWeight: 600 }}>{`  ·  ${title}`}</span>}
                      {entry.action === "task_completed" && <span style={{ color: "#4b5563" }}>  (from task)</span>}
                      {entry.staff_info && <span style={{ float: "right", color: "#4b5563" }}>{`${staffName(entry.staff_info)}, ${humanize(entry.staff_info.role)}`}</span>}
                    </td>
                  </tr>
                  {!r && (
                    <tr><td /><td colSpan={2} style={{ ...td, color: "#6b7280", fontStyle: "italic" }}>This record is no longer available.</td></tr>
                  )}
                  {rows.map(([label, value]) => (
                    <tr key={label}>
                      <td />
                      <th style={th}>{label}</th>
                      <td style={td}>{value}</td>
                    </tr>
                  ))}
                  <tr><td colSpan={3} style={{ height: 5 }} /></tr>
                </tbody>
              </table>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const SkeletonCard = ({ h = "h-16" }) => <div className={`bg-white border border-gray-200 rounded-xl ${h} animate-pulse`} />;

// Read-only record of one discharged stay or closed visit; shared by the nurse and doctor portals
const DischargedPatientRecord = ({ patient: patientProp, admission, isOutPatient, onBack }) => {
  // Stay rows carry discharge_date, closed visit rows carry closed_at
  const outFromRow = !admission?.discharge_date && !!admission?.closed_at;
  const [current, setCurrent] = useState({ kind: (isOutPatient ?? outFromRow) ? "check_in" : "admission", row: admission });
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [filter, setFilter] = useState("all");
  const row = current.row || {};
  const isOut = current.kind === "check_in";
  const hin = patientProp?.hin || admission?.patient_info?.hin || row?.patient_info?.hin;

  const { data: patientFullInfo } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: () => fetchPatientInfo(hin),
    enabled: !!hin,
    staleTime: 5 * 60 * 1000,
  });
  const patient = { ...(admission?.patient_info || {}), ...(patientProp || {}), ...(patientFullInfo?.patient_info || {}) };

  const { data: entries = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["encounter-records", current.kind, row.sqid],
    queryFn: () => fetchEncounterRecords({ kind: current.kind, sqid: row.sqid }),
    enabled: !!row.sqid,
    staleTime: 60 * 1000,
  });

  const { data: encounters = [], isFetching: loadingEncounters } = useQuery({
    queryKey: ["patient-discharged-encounters", hin],
    queryFn: () => fetchPatientDischargedEncounters(hin),
    enabled: !!hin,
    staleTime: 5 * 60 * 1000,
  });

  const name = [patient?.firstname, patient?.lastname].filter(Boolean).join(" ") || "Patient";
  const age = ageFrom(patient?.dob);
  const provider = patient?.payment_provider?.type;
  const startedAt = row.created_at;
  const endedAt = row.discharge_date || row.closed_at;
  const closedBy = isOut ? row.closed_by_info : row.discharged_by_info;
  const summary = isOut ? null : buildSummary(row, entries);
  const options = encounters.some((e) => e.row.sqid === row.sqid) ? encounters : [current, ...encounters];

  const counts = useMemo(() => {
    const c = { all: entries.length };
    entries.forEach((e) => { const g = typeOf(e.record_type).group; c[g] = (c[g] || 0) + 1; });
    return c;
  }, [entries]);
  const entriesFor = (f) => entries.filter((e) => f === "all" || typeOf(e.record_type).group === f);
  const groupByDay = (list) => list.reduce((acc, e) => {
    const day = fmtDay(e.created_at);
    (acc[day] ||= []).push(e);
    return acc;
  }, {});

  // Print the whole record: render the print copy, then open the browser's save-as-PDF dialog
  useEffect(() => {
    if (!printing) return undefined;
    const previousTitle = document.title;
    document.title = `Patient record - ${[patient?.firstname, patient?.lastname].filter(Boolean).join(" ")} - ${encounterLabel(current)}`;
    const done = () => { setPrinting(false); document.title = previousTitle; };
    window.addEventListener("afterprint", done, { once: true });
    const t = setTimeout(() => window.print(), 150);
    return () => { clearTimeout(t); window.removeEventListener("afterprint", done); document.title = previousTitle; };
  }, [printing]); // eslint-disable-line react-hooks/exhaustive-deps

  const facts = [
    ["Patient HIN", maskHin(hin)],
    ["Age · Gender", [age != null ? age : null, titleCase(patient?.gender)].filter(Boolean).join(" · ") || "N/A"],
    ["Date of birth", fmtDate(patient?.dob, { day: "numeric", month: "short", year: "numeric" })],
    ["Phone", patient?.phone_num || "N/A"],
    ["Discharged by", closedBy ? staffName(closedBy) : isOut ? "Closed automatically" : "N/A"],
    [isOut ? "Checked in" : "Admitted", fmtDateTime(startedAt)],
    ["Discharged", fmtDateTime(endedAt)],
  ];

  const errorText = error?.response?.status === 403
    ? "Only doctors and nurses can view this record."
    : error?.response?.status === 404
      ? "This visit or stay could not be found at your hospital."
      : "Could not load the care record.";

  const shown = entriesFor(filter);

  const renderRecord = () => (
    <>
        {/* Patient card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-semibold shrink-0">
              {`${patient?.firstname?.[0] ?? ""}${patient?.lastname?.[0] ?? ""}`.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{name}</h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {provider && (
                  <span className="text-xs font-medium bg-docuhealth-light-green text-docuhealth-green-dark px-2.5 py-0.5 rounded-full">
                    {provider.toUpperCase() === "HMO" ? "HMO" : titleCase(provider.toLowerCase())} patient
                  </span>
                )}
                <span className="text-xs font-medium bg-docuhealth-primary-lightest text-docuhealth-primary px-2.5 py-0.5 rounded-full">
                  {isOut ? "Outpatient visit" : "Inpatient stay"}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> Discharged
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-x-4 gap-y-4 border-t border-gray-100 pt-4">
            {facts.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase mb-1">{label}</p>
                <p className="text-[13px] text-gray-900 break-words">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-md px-3 py-2.5 mt-5 text-xs text-gray-600">
            <Lock className="w-3.5 h-3.5 mt-px shrink-0" />
            <span>
              {isOut ? "Visit" : "Stay"} closed {closedBy ? `by ${staffName(closedBy)} ` : isOut ? "automatically " : ""}on {fmtDateTime(endedAt)}. Everything below is read-only.
            </span>
          </div>
        </div>

        {/* Discharge summary (in-patient stays only; out-patient visits close without a form) */}
        {!isOut && (
          <div className="bg-white border border-gray-200 rounded-xl mb-6">
            {summary ? (
              <>
                <button onClick={() => setSummaryOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 p-5 cursor-pointer text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900 mr-1">Discharge summary</h3>
                    {summary.author && (
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        <User className="w-3 h-3" /> {staffName(summary.author)}
                      </span>
                    )}
                    {summary.at && (
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> {fmtDate(summary.at, { day: "numeric", month: "short" })}, {fmtTime(summary.at)}
                      </span>
                    )}
                  </div>
                  {summaryOpen ? <ChevronUp className="w-5 h-5 text-docuhealth-primary shrink-0" /> : <ChevronDown className="w-5 h-5 text-docuhealth-primary shrink-0" />}
                </button>
                {summaryOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 px-5 pb-2">
                    {summary.items.map((item) => (
                      <div key={item.label} className="py-4 border-t border-gray-100 xl:[&:not(:nth-child(4n+1))]:pl-5 xl:[&:not(:nth-child(4n))]:pr-5 xl:[&:not(:nth-child(4n))]:border-r sm:max-xl:odd:pr-5 sm:max-xl:odd:border-r sm:max-xl:even:pl-5">
                        <Label>{item.label}</Label>
                        {item.vitals ? (
                          <p className="text-[13px] text-gray-800 leading-relaxed">
                            BP <span className={isHighBp(item.vitals.blood_pressure) ? "text-red-600 font-semibold" : ""}>{item.vitals.blood_pressure || "N/A"}</span>
                            {[item.vitals.heart_rate && ` · HR ${item.vitals.heart_rate}`, item.vitals.temp && ` · T ${item.vitals.temp}°C`, item.vitals.resp_rate && ` · RR ${item.vitals.resp_rate}`, item.vitals.spo2 && ` · SpO₂ ${item.vitals.spo2}%`].filter(Boolean).join("")}
                          </p>
                        ) : (
                          <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-line">{item.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-5">
                <h3 className="text-base font-semibold text-gray-900">Discharge summary</h3>
                <p className="text-[13px] text-gray-500 mt-1">No discharge summary was recorded for this stay.</p>
              </div>
            )}
          </div>
        )}

        {/* Care record */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Care record</h3>
            <p className="text-[13px] text-gray-400">{isLoading ? "Loading entries..." : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} · oldest first`}</p>
          </div>
          <div className="flex items-center overflow-x-auto bg-white border border-gray-100 rounded-lg p-1">
            {FILTERS.map(([key, label], i) => (
              <React.Fragment key={key}>
                {/* Divider hides next to the active pill but keeps its slot so tabs don't shift */}
                {i > 0 && (
                  <span className={`w-px h-[18px] shrink-0 ${filter !== key && filter !== FILTERS[i - 1][0] ? "bg-gray-300" : "bg-transparent"}`} />
                )}
                <button
                  onClick={() => setFilter(key)}
                  className={`px-3.5 py-1.5 mx-0.5 rounded-md text-xs whitespace-nowrap cursor-pointer transition-colors ${filter === key ? "bg-docuhealth-primary-lightest text-docuhealth-blue-bright font-semibold" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {label} ({counts[key] || 0})
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard /><SkeletonCard h="h-32" /><SkeletonCard /><SkeletonCard h="h-24" />
          </div>
        ) : isError ? (
          <div className="bg-white border border-gray-200 rounded-xl py-10 text-center">
            <p className="text-gray-600">{errorText}</p>
            {![403, 404].includes(error?.response?.status) && (
              <button onClick={() => refetch()} className="mt-3 px-5 py-2 rounded-full border border-docuhealth-primary text-docuhealth-primary text-[13px] cursor-pointer hover:bg-blue-50">
                Try again
              </button>
            )}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-10 px-4 text-center">
            <p className="text-gray-600">Nothing was recorded for this {isOut ? "visit" : "stay"}.</p>
            <p className="text-[13px] text-gray-400 mt-1">Older visits and stays may show fewer records than they really had.</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-10 text-center text-gray-500">No entries of this kind for this {isOut ? "visit" : "stay"}.</div>
        ) : (
          Object.entries(groupByDay(shown)).map(([day, list]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-[13px] font-medium text-gray-900">{day}</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <ol>
                {list.map((entry, i) => {
                  const last = i === list.length - 1;
                  return (
                    <li key={entry.sqid} className="flex gap-2 sm:gap-3">
                      <span className="w-10 sm:w-12 shrink-0 pt-3.5 text-xs sm:text-[13px] text-gray-500 tabular-nums">{fmtTime(entry.created_at)}</span>
                      <div className="relative flex flex-col items-center w-3 shrink-0">
                        <span className={`mt-4 w-3 h-3 rounded-full border-2 z-10 ${DOT_STYLES[entry.record_type] || "bg-white border-gray-400"}`} />
                        {!last && <span className="absolute top-4 bottom-0 w-px bg-gray-200" />}
                      </div>
                      <div className="flex-1 min-w-0 pb-3">
                        <div className="bg-white border border-gray-200 rounded-xl">
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
    </>
  );

  return (
    <div className="text-sm text-gray-800">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-[13px] mb-2 cursor-pointer print:hidden">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Patient Records</h1>
          <p className="text-[13px] text-gray-400">{fmtDate(new Date(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(",", "")}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Dropdown
            trigger={(open, toggle) => (
              <button onClick={toggle} className="flex items-center gap-2 border border-gray-200 bg-white rounded-md px-3.5 py-2 text-[13px] text-gray-800 cursor-pointer hover:bg-gray-50">
                {encounterLabel(current)}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            )}
          >
            {(close) => (
              <>
                {options.map((o) => (
                  <button
                    key={`${o.kind}-${o.row.sqid}`}
                    onClick={() => { setCurrent(o); setFilter("all"); close(); }}
                    className={`block w-full text-left px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 ${o.row.sqid === row.sqid ? "text-docuhealth-primary font-medium" : "text-gray-700"}`}
                  >
                    {encounterLabel(o)}
                  </button>
                ))}
                {loadingEncounters && <p className="px-3 py-2 text-xs text-gray-400">Loading other visits...</p>}
              </>
            )}
          </Dropdown>
          <Dropdown
            trigger={(open, toggle) => (
              <button onClick={toggle} className="flex items-center gap-2 bg-docuhealth-primary hover:bg-docuhealth-primary-hover text-white rounded-md px-3.5 py-2 text-[13px] font-medium cursor-pointer">
                <Download className="w-4 h-4" /> Download
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            )}
          >
            {(close) => (
              <button
                disabled={isLoading}
                onClick={() => { close(); setPrinting(true); }}
                className="block w-full text-left px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading record..." : "Download as PDF"}
              </button>
            )}
          </Dropdown>
        </div>
      </div>

      {renderRecord()}

      {printing && createPortal(
        <div className="dh-print-root">
          <style>{PRINT_CSS}</style>
          <PrintDocument
            name={name}
            facts={facts}
            encounter={`${isOut ? "Outpatient" : "Inpatient"} ${encounterLabel(current).replace(/^(Stay|Visit)/, (w) => w.toLowerCase())}`}
            closedLine={`${isOut ? "Visit" : "Stay"} closed ${closedBy ? `by ${staffName(closedBy)} ` : isOut ? "automatically " : ""}on ${fmtDateTime(endedAt)}.`}
            summary={summary}
            isOut={isOut}
            entries={entries}
          />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default DischargedPatientRecord;
