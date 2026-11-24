import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one "nothing here" picture, used by every empty table, list and screen: an open tray with
 * a blank page and a magnifier. Drawn from the theme's tokens, so it follows the brand colour.
 */
function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-40", className)}
    >
      {/* Ground shadow */}
      <ellipse cx="80" cy="108" rx="58" ry="6" className="fill-primary/5" />
      {/* Back of the tray */}
      <path d="M32 58 46 34h68l14 24" className="fill-primary/10" />
      {/* A blank page sticking out */}
      <rect
        x="54"
        y="16"
        width="52"
        height="58"
        rx="4"
        className="fill-card stroke-primary/30"
        strokeWidth="1.5"
      />
      <path
        d="M63 30h34M63 39h26M63 48h30"
        className="stroke-primary/20"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Front of the tray */}
      <path
        d="M30 58h30l5 10h30l5-10h30v36a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V58Z"
        className="fill-primary/15 stroke-primary/40"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Magnifier */}
      <circle cx="122" cy="34" r="11" className="fill-card stroke-primary" strokeWidth="3" />
      <path d="m130 42 8 8" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
      {/* Sparkles */}
      <path
        d="M24 30v8M20 34h8M140 76v6M137 79h6"
        className="stroke-primary/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * What an empty table, list or screen shows: the illustration, a title, a line about why it's
 * empty, and optionally what to do next (`action`, e.g. an "Add Staff" button). `compact` is for
 * inside a table or card; the default is for a whole screen or section.
 */
export function EmptyState({
  title,
  description,
  action,
  compact = false,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-2 py-6" : "gap-3 py-12",
        className,
      )}
    >
      <EmptyIllustration className={compact ? "w-24" : "w-40"} />
      <div className="flex max-w-sm flex-col gap-1">
        {title && (
          <p className={cn("text-fg-heading", compact ? "type-body-sm-medium" : "type-body")}>
            {title}
          </p>
        )}
        {description && (
          <p className={cn("text-fg-caption", compact ? "type-caption" : "type-body-sm-regular")}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
