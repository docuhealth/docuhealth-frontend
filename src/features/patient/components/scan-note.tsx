import type { ReactNode } from "react";

/** A blue note on the scan pages, e.g. "Your doctor will go through this report with you…". */
export function ScanNote({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-info-100 px-3 py-2.5">
      {title && <p className="type-body-sm-tight-semibold text-info-700">{title}</p>}
      <p className="type-caption text-info-700">{children}</p>
    </div>
  );
}
