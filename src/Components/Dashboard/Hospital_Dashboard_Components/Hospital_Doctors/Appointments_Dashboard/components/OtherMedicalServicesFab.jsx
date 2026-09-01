import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import OrderLabModal from "./OrderLabModal";
import RequestVitalsModal from "./RequestVitalsModal";
import VitalSignsTaskModal from "./VitalSignsTaskModal";
import FluidIntakeOutputModal from "./FluidIntakeOutputModal";
import WardProcedureModal from "./WardProcedureModal";
import GlucoseMonitoringModal from "./GlucoseMonitoringModal";
import DrugTaskModal from "./DrugTaskModal";
import IVFluidModal from "./IVFluidModal";
import SeizureEventModal from "./SeizureEventModal";

// `action: null` means there's no flow built for that item yet, so it just
// surfaces a "coming soon" toast instead of opening a modal with nothing
// to show. `admissionOnly: true` means the item creates a care task via
// POST /api/inpatients/admissions/<sqid>/tasks, which needs a real
// admission sqid — it's only usable when this FAB was mounted with one
// (i.e. from an admitted/inpatient context, not an appointment/check-in).
const QUICK_SERVICES = [
  { id: "lab", label: "Order lab", action: "lab" },
  { id: "scan", label: "Order scan/X-ray", action: null },
  { id: "pharmacy", label: "Order pharmacy", action: "pharmacy" },
  { id: "drug-task", label: "Drug task (nurse)", action: "drug-task", admissionOnly: true },
  { id: "vitals", label: "Vitals", action: "vitals" },
  { id: "vitals-task", label: "Vitals monitoring task", action: "vitals-task", admissionOnly: true },
  { id: "procedure", label: "Procedure", action: "procedure", admissionOnly: true },
  { id: "input-output", label: "Input and output", action: "input-output", admissionOnly: true },
  { id: "iv-fluid", label: "IV fluid", action: "iv-fluid", admissionOnly: true },
  { id: "seizure", label: "Seizure events", action: "seizure" },
  { id: "glucose", label: "Glucose monitoring", action: "glucose", admissionOnly: true },
];

/**
 * Floating action button that expands into a quick-service menu. Each
 * mapped item opens its own standalone modal directly (no shared "Other
 * medical services" picker in between); "Order pharmacy" has no modal of
 * its own — it hands off to the parent via onOrderPharmacy, which redirects
 * to the Prescribe Medication screen. Unmapped items just show a "coming
 * soon" toast, and admission-only items do the same when there's no
 * admission in context.
 */
const OtherMedicalServicesFab = ({ selectedPatientDetails, admissionSqid, onOrderPharmacy }) => {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "lab" | "vitals" | "vitals-task" | "input-output" | "procedure" | "glucose" | "drug-task" | "iv-fluid" | "seizure" | null
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleItemClick = (item) => {
    setOpen(false);

    if (item.admissionOnly && !admissionSqid) {
      toast.error("Only available for admitted patients.");
      return;
    }

    switch (item.action) {
      case "lab":
        setActiveModal("lab");
        break;
      case "vitals":
        setActiveModal("vitals");
        break;
      case "vitals-task":
        setActiveModal("vitals-task");
        break;
      case "input-output":
        setActiveModal("input-output");
        break;
      case "procedure":
        setActiveModal("procedure");
        break;
      case "glucose":
        setActiveModal("glucose");
        break;
      case "drug-task":
        setActiveModal("drug-task");
        break;
      case "iv-fluid":
        setActiveModal("iv-fluid");
        break;
      case "seizure":
        setActiveModal("seizure");
        break;
      case "pharmacy":
        onOrderPharmacy?.();
        break;
      default:
        toast.error("Feature coming soon");
    }
  };

  return (
    <>
      <div ref={containerRef} className="fixed bottom-16 right-8 z-40">
        {open && (
          <div className="absolute bottom-[72px] right-0 w-68 max-w-[75vw] rounded-3xl bg-white p-4 shadow-2xl">
            <ul>
              {QUICK_SERVICES.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-3 text-left text-docuhealth-primary cursor-pointer transition hover:bg-docuhealth-primary-lightest"
                  >
                    <i className="bx bx-plus text-lg shrink-0"></i>
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close other medical services menu" : "Other medical services"}
          aria-expanded={open}
          title="Other medical services"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-docuhealth-primary text-white shadow-[0_8px_30px_rgba(62,64,149,0.55)] cursor-pointer transition-transform duration-200 hover:scale-105"
        >
          <i className={`bx ${open ? "bx-x" : "bx-plus"} text-2xl`}></i>
        </button>
      </div>

      {activeModal === "lab" && (
        <OrderLabModal
          selectedPatientDetails={selectedPatientDetails}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "vitals" && (
        <RequestVitalsModal
          selectedPatientDetails={selectedPatientDetails}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "vitals-task" && (
        <VitalSignsTaskModal admissionSqid={admissionSqid} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "input-output" && (
        <FluidIntakeOutputModal admissionSqid={admissionSqid} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "procedure" && (
        <WardProcedureModal admissionSqid={admissionSqid} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "glucose" && (
        <GlucoseMonitoringModal admissionSqid={admissionSqid} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "drug-task" && (
        <DrugTaskModal admissionSqid={admissionSqid} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "iv-fluid" && (
        <IVFluidModal admissionSqid={admissionSqid} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "seizure" && (
        <SeizureEventModal onClose={() => setActiveModal(null)} />
      )}
    </>
  );
};

export default OtherMedicalServicesFab;
