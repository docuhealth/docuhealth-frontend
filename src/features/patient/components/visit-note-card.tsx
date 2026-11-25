import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tags = { primary: "bg-primary", success: "bg-success-500" };

/** A part of a visit summary: a colored tag ("Reason", "Diagnosis") over its text. */
export function VisitNoteCard({
  icon,
  label,
  tone,
  children,
}: {
  icon: ReactNode;
  label: string;
  tone: keyof typeof tags;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 type-caption-semibold text-white [&_svg]:size-3.5",
          tags[tone],
        )}
      >
        {icon}
        {label}
      </span>
      <p className="mt-3 type-body-sm-regular text-fg-body">{children}</p>
    </div>
  );
}
