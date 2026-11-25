import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  info: "bg-info-100 text-info-700",
  neutral: "bg-line text-fg-body",
  brand: "bg-brand-50 text-primary",
};

/** A short word on a tint, without a dot: "New", "Normal", "A little high". */
export function Tag({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 type-caption-semibold", tones[tone])}>
      {children}
    </span>
  );
}
