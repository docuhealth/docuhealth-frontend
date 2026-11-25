import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tags = {
  primary: "bg-primary",
  info: "bg-info-500",
  success: "bg-success-700",
  error: "bg-error-500",
};

/** A part of a visit summary: a colored tag ("Reason", "Note") over its text, `aside` beside it. */
export function VisitNoteCard({
  icon,
  label,
  tone,
  aside,
  children,
}: {
  icon: ReactNode;
  label: string;
  tone: keyof typeof tags;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 type-caption-semibold text-white [&_svg]:size-3.5",
            tags[tone],
          )}
        >
          {icon}
          {label}
        </span>
        {aside}
      </div>
      <p className="mt-3 type-body-sm-regular whitespace-pre-line text-fg-body">{children}</p>
    </section>
  );
}
