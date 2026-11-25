import { useState } from "react";
import { ScanCard } from "@/features/patient/components/scan-card";

/** The radiologist's findings, cut to two lines until "Read full report". */
export function ScanFullReport({ findings }: { findings: string }) {
  const [open, setOpen] = useState(false);
  return (
    <ScanCard title="Full report">
      <p className={open ? "type-body-sm-regular" : "line-clamp-2 type-body-sm-regular"}>
        Findings: {findings}
      </p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="self-start type-link-sm text-primary hover:underline"
      >
        {open ? "Show less" : "Read full report"}
      </button>
    </ScanCard>
  );
}
