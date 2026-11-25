import type { ReactNode } from "react";

/** A white card on the scan details page with a title: "Images (2)", "Impression", "Progress". */
export function ScanCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h2 className="type-heading-sm-regular text-fg-heading">{title}</h2>
      {children}
    </section>
  );
}
