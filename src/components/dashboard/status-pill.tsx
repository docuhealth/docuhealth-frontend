import type { ReactNode } from "react";

const tones = {
  warning: "bg-warning-100 text-warning-500",
  success: "bg-success-100 text-success-500",
  info: "bg-info-100 text-info-500",
  neutral: "bg-line text-fg-body",
  error: "bg-error-100 text-error-500",
};

/**
 * A short status on a tinted background, led by a dot in the same color. It stays on one line
 * where there's room; in a narrow column (e.g. a phone list's grid) a long status ("Awaiting nurse
 * discharge") wraps inside the pill instead of spilling out of it.
 */
export function StatusPill({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span
      className={`inline-flex max-w-full items-start gap-1.5 rounded-[4px] px-1.5 py-0.5 type-caption-semibold text-pretty ${tones[tone]}`}
    >
      {/* Centred on the first line, however many lines the status takes. */}
      <span aria-hidden className="mt-[0.45lh] size-1 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}
