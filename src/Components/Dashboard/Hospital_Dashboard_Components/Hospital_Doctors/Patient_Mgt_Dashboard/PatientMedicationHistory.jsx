import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pill, Search } from "lucide-react";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import Skeleton from "../../../../ui/Skeleton";
import EmptyState from "../../../../ui/EmptyState";
import { fetchMedicationHistory } from "../../../../../queries/Hospital/doctor/medicationHistory";
import { extractApiErrorMessage } from "../../../../../utils/apiError";
import { formatFrequency } from "../../../../../utils/careTaskConstants";


const formatDuration = (d) => {
  if (!d) return "-";
  if (typeof d === "string") return d;
  return [d.value != null ? Number(d.value) : null, d.rate].filter((x) => x !== null && x !== "").join(" ") || "-";
};

const formatDose = (drug) =>
  [drug.quantity != null ? Number(drug.quantity) : null, drug.unit].filter((x) => x !== null && x !== "").join(" ") || "-";

const staffName = (s) =>
  s ? `${s.role === "doctor" ? "Dr. " : ""}${[s.firstname, s.lastname].filter(Boolean).join(" ")}`.trim() : "-";

// Where the record came from. A row means the drug was recorded, not that a dose was given.
const sourceOf = ({ event }) => {
  if (event.action === "discharge") return "Discharge medication";
  if (event.action === "task_completed") return "Medication task";
  if (event.staff_info?.role === "nurse") return "Nurse drug chart";
  return "Prescribed";
};

const encounterOf = (event) => {
  const type = event.workflow?.type;
  if (type === "Admission") return "Inpatient stay";
  if (type === "ClinicalInteraction") return "Outpatient visit";
  if (type === "Appointment") return "Appointment";
  return null;
};

// Same layout as the loaded tab: search, then the medication table.
const MedicationHistorySkeleton = () => (
  <div role="status" aria-label="Loading medication history" className="space-y-5">
    <div className="flex justify-end">
      <Skeleton className="h-8 w-full md:w-64 rounded-full" />
    </div>
    <div className="overflow-x-auto bg-white border rounded-xl">
      <div className="min-w-[820px]">
        <div className="border-b bg-gray-50/80 px-4 py-3.5 flex gap-6">
          {[96, 40, 44, 64, 56, 80, 40].map((w, i) => (
            <Skeleton key={i} className="h-2.5" style={{ width: w, flex: i === 0 ? "1 1 0" : undefined }} />
          ))}
        </div>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="px-4 py-3.5 border-b last:border-b-0 border-gray-100 flex items-start gap-6">
            <div className="flex items-start gap-2.5 flex-1">
              <Skeleton className="h-7 w-7 rounded-md" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            {[48, 40, 36, 48].map((w, j) => (
              <Skeleton key={j} className="h-3 mt-1" style={{ width: w }} />
            ))}
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-12" />
            </div>
            <Skeleton className="h-3 w-32 mt-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Ongoing drugs from the patient record (already loaded with the patient), shown
// above the history and while it loads.
const OngoingDrugsStrip = ({ drugs }) =>
  drugs.length > 0 ? (
    <div className="border rounded-xl p-4 bg-emerald-50/40">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Current medications on the patient&apos;s record ({drugs.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {drugs.map((drug, i) => (
          <span key={`${drug.name}-${i}`} className="inline-flex items-center gap-1.5 text-xs bg-white border rounded-full px-3 py-1">
            <Pill size={12} className="text-emerald-600" />
            <span className="font-medium text-gray-800">{drug.name}</span>
            <span className="text-gray-500">
              {formatDose(drug)} · {formatFrequency(drug.frequency, "-")} · {formatDuration(drug.duration)}
            </span>
          </span>
        ))}
      </div>
    </div>
  ) : null;

const PatientMedicationHistory = ({ patientFullInfo, admissionSqid }) => {
  const hin = patientFullInfo?.patient_info?.hin;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: records = [], isLoading, isError, error } = useQuery({
    queryKey: ["patient-medication-history", hin],
    queryFn: fetchMedicationHistory,
    enabled: !!hin,
  });

  const ongoingDrugs = patientFullInfo?.ongoing_drugs || [];

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((rec) => {
      if (!q) return true;
      return [rec.drug.name, rec.drug.route, staffName(rec.event.staff_info)]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [records, searchQuery]);

  if (!hin || isLoading) {
    return (
      <div className="space-y-5">
        <OngoingDrugsStrip drugs={patientFullInfo?.ongoing_drugs || []} />
        <MedicationHistorySkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center">
        <EmptyState
          title="Couldn't load medication history"
          description={extractApiErrorMessage(error, "Please try again in a moment.")}
        />
      </div>
    );
  }

  if (records.length === 0 && ongoingDrugs.length === 0) {
    return (
      <div className="py-16 text-center">
        <EmptyState
          title="No medication history"
          description="No drugs have been prescribed or charted for this patient yet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OngoingDrugsStrip drugs={ongoingDrugs} />

      <div className="flex justify-end">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drug, route or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-docuhealth-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center text-xs text-gray-500">
          No drugs have been prescribed or charted at this hospital yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center text-xs text-gray-500">
          No medications match your filter or search.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl">
          <table className="w-full min-w-[820px] text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Medication</th>
                <th className="py-3 px-3">Dose</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3">Frequency</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Recorded by</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((rec) => {
                const { event, drug } = rec;
                const encounter = encounterOf(event);
                const thisStay = admissionSqid && event.workflow?.type === "Admission" && event.workflow?.sqid === admissionSqid;
                return (
                  <tr key={event.sqid} className="hover:bg-blue-50/30 transition-colors align-top">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md shrink-0 mt-0.5 bg-blue-50 text-docuhealth-primary">
                          <Pill size={15} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {[drug.name, drug.strength].filter(Boolean).join(" ") || "Medication"}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {[sourceOf(rec), encounter].filter(Boolean).join(" · ")}
                            {thisStay && (
                              <span className="ml-1.5 text-[10px] font-semibold text-docuhealth-primary bg-blue-50 px-1.5 py-0.5 rounded">
                                This stay
                              </span>
                            )}
                          </p>
                          {drug.allergies?.length > 0 && (
                            <p className="text-[10px] text-rose-600 mt-0.5">Allergies: {drug.allergies.join(", ")}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-gray-700 whitespace-nowrap">{formatDose(drug)}</td>
                    <td className="py-3.5 px-3 text-gray-700 whitespace-nowrap capitalize">{drug.route || "-"}</td>
                    <td className="py-3.5 px-3 text-gray-700 whitespace-nowrap">{formatFrequency(drug.frequency, "-")}</td>
                    <td className="py-3.5 px-3 text-gray-700 whitespace-nowrap">{formatDuration(drug.duration)}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-gray-800 text-[11px]">{staffName(event.staff_info)}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{event.staff_info?.role || ""}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                      {formatFullDateTime(event.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientMedicationHistory;
