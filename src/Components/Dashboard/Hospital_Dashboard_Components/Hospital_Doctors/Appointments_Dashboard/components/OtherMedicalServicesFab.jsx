import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import OrderLabModal from "./OrderLabModal";
import RequestVitalsModal from "./RequestVitalsModal";

// `action: null` means there's no flow built for that item yet, so it just
// surfaces a "coming soon" toast instead of opening a modal with nothing
// to show.
const QUICK_SERVICES = [
  { id: "lab", label: "Order lab", action: "lab" },
  { id: "scan", label: "Order scan/X-ray", action: null },
  { id: "pharmacy", label: "Order pharmacy", action: "pharmacy" },
  { id: "drug-task", label: "Drug task (nurse)", action: null },
  { id: "vitals", label: "Vitals", action: "vitals" },
  { id: "procedure", label: "Procedure", action: null },
  { id: "input-output", label: "Input and output", action: null },
  { id: "seizure", label: "Seizure events", action: null },
  { id: "glucose", label: "Glucose monitoring", action: null },
];

/**
 * Floating action button that expands into a quick-service menu. Each
 * mapped item opens its own standalone modal directly (no shared "Other
 * medical services" picker in between); "Order pharmacy" has no modal of
 * its own — it hands off to the parent via onOrderPharmacy, which redirects
 * to the Prescribe Medication screen. Unmapped items just show a "coming
 * soon" toast.
 */
const OtherMedicalServicesFab = ({ selectedPatientDetails, onOrderPharmacy }) => {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "lab" | "vitals" | null
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
    switch (item.action) {
      case "lab":
        setActiveModal("lab");
        break;
      case "vitals":
        setActiveModal("vitals");
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
    </>
  );
};

export default OtherMedicalServicesFab;
