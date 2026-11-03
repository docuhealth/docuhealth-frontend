import type { ReactNode } from "react";

const tones = {
  warning: "bg-warning-100 text-warning-500",
  success: "bg-success-100 text-success-500",
  info: "bg-info-100 text-info-500",
  neutral: "bg-line text-fg-body",
};

/** A short status on a tinted background, led by a dot in the same color. */
export function StatusPill({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 type-caption-semibold whitespace-nowrap ${tones[tone]}`}
    >
      <span aria-hidden className="size-1 rounded-full bg-current" />
      {children}
    </span>
  );
}
