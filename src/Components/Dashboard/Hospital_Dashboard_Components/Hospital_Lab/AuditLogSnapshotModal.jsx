import React, { useEffect } from "react";
import { ArrowRight, FlaskConical, User, ClipboardList, Info, X } from "lucide-react";
import { FIELD_LABELS, humanize, targetLabel, fieldLabel, personName, resultTestNames } from "./auditLogLabels";

const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In progress",
  sample_collected: "Sample collected",
  result_ready: "Result ready",
  completed: "Completed",
  lab_admin_approved: "Approved by lab admin, awaiting doctor",
  lab_admin_rejected: "Rejected by lab admin",
  result_accepted_by_lab_admin: "Approved by lab admin",
  result_accepted_by_doctor: "Approved by doctor",
  approved: "Approved",
  accepted: "Accepted",
  rejected: "Rejected",
};

// On a result, plain accepted/rejected is the doctor's decision
const RESULT_STATUS_LABELS = {
  pending: "Awaiting lab admin review",
  accepted: "Approved by doctor",
  rejected: "Rejected by doctor",
};

const STATUS_FIELDS = ["status", "aggregate_status"];

const formatDateTime = (isoString) => {
  if (!isoString) return "Not recorded";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const ageFrom = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age -= 1;
  return age;
};

const statusLabel = (status, targetType) => {
  if (!status) return "Not set";
  if (targetType === "lab_test_result" && RESULT_STATUS_LABELS[status]) return RESULT_STATUS_LABELS[status];
  return STATUS_LABELS[status] || humanize(status);
};

const formatValue = (field, value, targetType) => {
  if (value === null || value === undefined || value === "") return "Not recorded";
  if (STATUS_FIELDS.includes(field)) return statusLabel(value, targetType);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (field.endsWith("_at") || field.endsWith("_date")) return formatDateTime(value);
  if (typeof value === "object") return "Updated";
  return String(value);
};

const personWithRole = (p) => {
  const name = personName(p) || p?.staff_id || "Unknown staff";
  return p?.role ? `${name} (${humanize(p.role)})` : name;
};

// Plain fields the backend snapshots carry; ids and nested *_info objects are left out of the diff
const getChanges = (log) => {
  const before = log.before_state || {};
  const after = log.after_state || {};
  const keys = new Set(Object.keys(FIELD_LABELS));
  if (log.field_changed) keys.add(log.field_changed);
  return [...keys]
    .filter((k) => (k in before || k in after) && JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null))
    .sort((a, b) => (a === log.field_changed ? -1 : b === log.field_changed ? 1 : 0))
    .map((k) => ({
      field: k,
      before: formatValue(k, before[k], log.target_type),
      after: formatValue(k, after[k], log.target_type),
    }));
};

const resultTestName = (state) => {
  const names = resultTestNames(state);
  if (names.length === 0) return "this test";
  if (names.length <= 2) return names.join(" and ");
  return `${names.length} test parameters`;
};

const describeAction = (log) => {
  const actor = personName(log.staff_info) || "A staff member";
  const state = log.after_state || log.before_state || {};
  const testName = state.test_info?.name || "the test";
  switch (log.action) {
    case "test_order_created": {
      const count = state.items_info?.length || 0;
      const patient = personName(state.patient_info);
      return `${actor} ordered ${count === 1 ? "1 lab test" : `${count} lab tests`}${patient ? ` for ${patient}` : ""}.`;
    }
    case "test_order_item_accepted":
      return `${actor} accepted the request for ${testName} and started work on it.`;
    case "test_specimen_collection_recorded":
      return `${actor} recorded that the sample for ${testName} was collected on ${formatDateTime(state.specimen_collected_at)}.`;
    case "test_result_submitted":
      return `${actor} submitted results for ${resultTestName(state)} for lab admin review.`;
    case "test_result_approved_by_lab_admin":
      return `${actor} approved the results for ${resultTestName(state)} and sent them to the doctor.`;
    case "test_result_rejected_by_lab_admin":
      return `${actor} rejected the results for ${resultTestName(state)} and sent them back to the lab.`;
    case "test_result_approved_by_doctor":
      return `${actor} approved the results for ${resultTestName(state)}.`;
    case "test_result_rejected_by_doctor":
      return `${actor} rejected the results for ${resultTestName(state)}.`;
    case "test_result_downloaded": {
      const patient = personName(log.patient_info);
      return `${actor} downloaded the results for ${resultTestName(state)}${patient ? ` (patient: ${patient})` : ""}.`;
    }
    case "scan_result_downloaded": {
      const patient = personName(log.patient_info);
      return `${actor} downloaded the scan report${patient ? ` for ${patient}` : ""}.`;
    }
    default:
      return `${actor}: ${log.action_display || humanize(log.action)}.`;
  }
};

const rangeText = (p) => {
  if (p?.ref_text) return p.ref_text;
  const unit = p?.unit ? ` ${p.unit}` : "";
  if (p?.ref_low != null && p?.ref_high != null) return `${p.ref_low} to ${p.ref_high}${unit}`;
  if (p?.ref_low != null) return `Above ${p.ref_low}${unit}`;
  if (p?.ref_high != null) return `Below ${p.ref_high}${unit}`;
  return "Not set";
};

const rangeFlag = (value, p) => {
  const n = parseFloat(value);
  if (Number.isNaN(n) || !p) return null;
  if (p.ref_low != null && n < p.ref_low) return { label: "Low", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (p.ref_high != null && n > p.ref_high) return { label: "High", cls: "bg-rose-50 text-rose-700 border-rose-200" };
  if (p.ref_low != null || p.ref_high != null) return { label: "Normal", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return null;
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border-b border-gray-200">
      <Icon className="w-4 h-4 text-docuhealth-primary shrink-0" />
      <p className="font-semibold text-slate-700 text-sm">{title}</p>
    </div>
    <div className="p-3 sm:p-4">{children}</div>
  </div>
);

// wide spans the full row; className overrides it for fields that only need the full row on phones
const Detail = ({ label, value, wide, className }) =>
  value === null || value === undefined || value === "" ? null : (
    <div className={`min-w-0 ${className ?? (wide ? "col-span-2" : "")}`}>
      <p className="text-gray-400 text-[11px]">{label}</p>
      <p className="font-medium text-slate-800 break-words">{value}</p>
    </div>
  );

const DetailGrid = ({ children }) => <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-3">{children}</div>;

const FlagBadge = ({ flag }) =>
  flag ? (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${flag.cls}`}>{flag.label}</span>
  ) : (
    <span className="text-gray-400 text-[11px] shrink-0">Not set</span>
  );

const PatientDetails = ({ patient }) => {
  if (!patient) return null;
  const age = ageFrom(patient.dob);
  return (
    <Section icon={User} title="Patient">
      <DetailGrid>
        <Detail label="Name" value={personName(patient)} />
        <Detail label="Health ID (HIN)" value={patient.hin} />
        <Detail label="Gender" value={patient.gender ? humanize(patient.gender) : null} />
        <Detail
          label="Date of birth"
          value={patient.dob ? `${formatDate(patient.dob)}${age != null ? ` (${age} yrs)` : ""}` : null}
        />
      </DetailGrid>
    </Section>
  );
};

const ResultValues = ({ parameters }) => {
  if (!parameters?.length) return <p className="text-gray-500">No result values recorded.</p>;
  return (
    <>
      {/* Phones: one card per value instead of a squeezed 4-column table */}
      <ul className="sm:hidden divide-y divide-gray-100">
        {parameters.map((row, i) => {
          const p = row.parameter_info || {};
          return (
            <li key={p.sqid || i} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-slate-800 min-w-0 break-words">{p.name || "Parameter"}</p>
                <FlagBadge flag={rangeFlag(row.value, p)} />
              </div>
              <p className="text-slate-800 mt-0.5">
                <span className="font-semibold">{row.value ?? "Not recorded"}</span>
                {p.unit && row.value != null ? <span className="text-gray-500"> {p.unit}</span> : null}
              </p>
              <p className="text-[11px] text-gray-500">Normal range: {rangeText(p)}</p>
            </li>
          );
        })}
      </ul>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 text-[11px] border-b border-gray-100">
              <th className="py-2 pr-3 font-medium">Test</th>
              <th className="py-2 pr-3 font-medium">Result</th>
              <th className="py-2 pr-3 font-medium">Normal range</th>
              <th className="py-2 font-medium">Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parameters.map((row, i) => {
              const p = row.parameter_info || {};
              const flag = rangeFlag(row.value, p);
              return (
                <tr key={p.sqid || i}>
                  <td className="py-2 pr-3 text-slate-800 font-medium">{p.name || "Parameter"}</td>
                  <td className="py-2 pr-3 text-slate-800">
                    {row.value ?? "Not recorded"} {p.unit && row.value != null ? <span className="text-gray-500">{p.unit}</span> : null}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{rangeText(p)}</td>
                  <td className="py-2">
                    <FlagBadge flag={flag} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const OrderDetails = ({ state }) => (
  <>
    <PatientDetails patient={state.patient_info} />
    <Section icon={ClipboardList} title="Order">
      <DetailGrid>
        <Detail label="Ordered by" value={state.ordered_by_info ? personWithRole(state.ordered_by_info) : null} />
        <Detail label="Hospital" value={state.hospital_info?.name} />
        <Detail label="Ordered on" value={state.created_at ? formatDateTime(state.created_at) : null} />
        <Detail label="Overall status" value={state.aggregate_status ? statusLabel(state.aggregate_status) : null} />
        <Detail label="Note" value={state.note} wide />
      </DetailGrid>
    </Section>
    {state.items_info?.length > 0 && (
      <Section icon={FlaskConical} title={`Tests ordered (${state.items_info.length})`}>
        <ul className="divide-y divide-gray-100">
          {state.items_info.map((item, i) => (
            <li key={item.sqid || i} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">{item.test_info?.name || "Lab test"}</p>
                <p className="text-[11px] text-gray-500">{item.test_info?.category?.name}</p>
              </div>
              <span className="text-[11px] text-gray-600 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                {statusLabel(item.status)}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    )}
  </>
);

const OrderItemDetails = ({ state }) => {
  const test = state.test_info || {};
  const specimen = test.specimens?.find((s) => s.is_preferred) || test.specimens?.[0];
  return (
    <>
      <PatientDetails patient={state.patient_info} />
      <Section icon={FlaskConical} title="Test">
        <DetailGrid>
          <Detail label="Test name" value={test.name} />
          <Detail label="Category" value={test.category?.name} />
          <Detail
            label="Sample type"
            value={specimen ? `${specimen.name}${specimen.container ? `, ${specimen.container}` : ""}` : null}
          />
          <Detail label="Fasting required" value={test.fasting_required == null ? null : test.fasting_required ? "Yes" : "No"} />
          <Detail label="Status" value={statusLabel(state.status)} />
          <Detail label="Sample collected" value={formatDateTime(state.specimen_collected_at)} />
          <Detail label="Expected turnaround" value={test.turnaround_hours ? `${test.turnaround_hours} hours` : null} />
          <Detail label="Rejection reason" value={state.rejection_reason} wide />
          <Detail label="Special instructions" value={test.special_instructions} wide />
        </DetailGrid>
      </Section>
      {state.result_info?.parameters_info && (
        <Section icon={ClipboardList} title="Result">
          <ResultValues parameters={state.result_info.parameters_info} />
        </Section>
      )}
    </>
  );
};

const ResultDetails = ({ state }) => (
  <>
    <Section icon={FlaskConical} title="Result values">
      <ResultValues parameters={state.parameters_info} />
    </Section>
    <Section icon={ClipboardList} title="Result details">
      <DetailGrid>
        <Detail label="Status" value={statusLabel(state.status, "lab_test_result")} />
        <Detail label="Submitted by" value={state.submitted_by_info ? personWithRole(state.submitted_by_info) : null} />
        <Detail label="Submitted on" value={state.created_at ? formatDateTime(state.created_at) : null} />
        <Detail label="Interpretation" value={state.interpretation} />
        <Detail label="Clinical correlation" value={state.clinical_correlation} wide />
        <Detail label="Comments" value={state.comments} wide />
      </DetailGrid>
    </Section>
  </>
);

const asLines = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim()).filter(Boolean);

const LineList = ({ label, value }) => {
  const lines = asLines(value);
  if (!lines.length) return null;
  return (
    <div className="col-span-2">
      <p className="text-gray-400 text-[11px]">{label}</p>
      {lines.length === 1 ? (
        <p className="font-medium text-slate-800 break-words">{lines[0]}</p>
      ) : (
        <ol className="list-decimal pl-4 space-y-0.5 font-medium text-slate-800">
          {lines.map((l, i) => (
            <li key={i} className="break-words">{l}</li>
          ))}
        </ol>
      )}
    </div>
  );
};

const ScanResultDetails = ({ state }) => (
  <Section icon={ClipboardList} title="Scan report">
    <DetailGrid>
      <Detail label="Status" value={statusLabel(state.status)} />
      <Detail label="Reported on" value={state.reported_at ? formatDateTime(state.reported_at) : null} />
      <Detail
        label="Reported by"
        value={[state.reporter_name, state.reporter_specialty].filter(Boolean).join(", ") || null}
        wide
      />
      <LineList label="Clinical indication" value={state.clinical_indication} />
      <LineList label="Findings" value={state.findings} />
      <LineList label="Impression" value={state.impression} />
      <LineList label="Recommendations" value={state.recommendation} />
      <Detail label="Extra comment" value={state.extra_comment} wide />
      <Detail label="Rejection reason" value={state.rejection_reason} wide />
      <Detail
        label="Attached images / documents"
        value={Array.isArray(state.attachments) ? (state.attachments.length ? `${state.attachments.length} attached` : "None") : null}
      />
    </DetailGrid>
  </Section>
);

// Unknown target types: show plain top-level fields only, never raw ids or nested objects
const GenericDetails = ({ state }) => {
  const rows = Object.entries(state).filter(
    ([k, v]) => k !== "sqid" && k !== "id" && !k.endsWith("_id") && (v === null || typeof v !== "object")
  );
  if (rows.length === 0) return null;
  return (
    <Section icon={ClipboardList} title="Details">
      <DetailGrid>
        {rows.map(([k, v]) => (
          <Detail key={k} label={fieldLabel(k)} value={formatValue(k, v)} />
        ))}
      </DetailGrid>
    </Section>
  );
};

const RecordDetails = ({ log }) => {
  const state = log.after_state || log.before_state;
  if (!state) return log.patient_info ? <PatientDetails patient={log.patient_info} /> : null;
  if (log.target_type === "lab_test_order") return <OrderDetails state={state} />;
  if (log.target_type === "lab_test_order_item") return <OrderItemDetails state={state} />;
  // Result and scan snapshots carry no patient; download entries put it on the log itself
  return (
    <>
      <PatientDetails patient={log.patient_info} />
      {log.target_type === "lab_test_result" ? (
        <ResultDetails state={state} />
      ) : log.target_type === "scan_result" ? (
        <ScanResultDetails state={state} />
      ) : (
        <GenericDetails state={state} />
      )}
    </>
  );
};

const AuditLogSnapshotModal = ({ log, onClose }) => {
  const isOpen = !!log;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!log) return null;
  const isNewRecord = !log.before_state && !!log.after_state;
  const changes = isNewRecord ? [] : getChanges(log);
  const staff = log.staff_info;

  // Own shell instead of ui/Modal: bottom sheet on phones, centered card from sm up,
  // capped to the screen height with a pinned header/footer so Close is always in reach on short laptop screens
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-log-details-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex flex-col w-full sm:max-w-2xl lg:max-w-3xl max-h-[92dvh] sm:max-h-[90dvh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="sm:hidden flex justify-center pt-2">
          <span className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <h3 id="audit-log-details-title" className="text-base sm:text-lg font-semibold text-gray-900">
            Audit Log Details
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 -mr-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 text-[13px] sm:text-sm">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3">
            <Info className="w-4 h-4 text-docuhealth-primary shrink-0 mt-0.5" />
            <p className="text-slate-800 leading-relaxed">{describeAction(log)}</p>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-3">
            <Detail label="Action" value={log.action_display || humanize(log.action)} />
            <Detail label="When" value={formatDateTime(log.created_at)} />
            <Detail
              label="Done by"
              className="col-span-2 sm:col-span-1"
              value={`${personWithRole(staff)}${
                staff?.specialization && !/^(n\/?a|none|-)$/i.test(staff.specialization.trim())
                  ? `, ${humanize(staff.specialization)}`
                  : ""
              }`}
            />
            <Detail label="Record" value={targetLabel(log.target_type)} />
          </div>

          {isNewRecord ? (
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-emerald-800">
              This is a new record. The details below show it as it was created.
            </div>
          ) : changes.length > 0 ? (
            <Section icon={ArrowRight} title="What changed">
              <div className="space-y-3">
                {changes.map((c) => (
                  <div key={c.field}>
                    <p className="text-[11px] text-gray-500 mb-1">{fieldLabel(c.field)}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center gap-2">
                      <span className="min-w-0 break-words bg-rose-50/80 border border-rose-100 text-rose-900 rounded-lg px-2.5 sm:px-3 py-2">
                        <span className="block text-[10px] uppercase font-bold text-rose-700">Before</span>
                        {c.before}
                      </span>
                      <ArrowRight className="hidden sm:block w-4 h-4 text-gray-400" />
                      <span className="min-w-0 break-words bg-emerald-50/80 border border-emerald-100 text-emerald-900 rounded-lg px-2.5 sm:px-3 py-2">
                        <span className="block text-[10px] uppercase font-bold text-emerald-700">After</span>
                        {c.after}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <RecordDetails log={log} />
        </div>

        <div className="flex justify-end px-4 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-docuhealth-primary text-white rounded-full font-medium hover:bg-docuhealth-dark-primary text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogSnapshotModal;
