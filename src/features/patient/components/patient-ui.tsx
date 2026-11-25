import { CaretRightIcon } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Pieces the patient's record pages share: a list card of rows, segmented tabs, a small
// uppercase section label and the "report a change" line.

/** A white card holding a list of `RecordRow`s. */
export function RecordList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul aria-label={label} className="flex flex-col divide-y rounded-xl border bg-card">
      {children}
    </ul>
  );
}

/** One row: a title, a line about it, an optional icon and status, opening `to` when given. */
export function RecordRow({
  title,
  detail,
  meta,
  icon,
  status,
  to,
  params,
}: {
  title: ReactNode;
  detail?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  status?: ReactNode;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
}) {
  const body = (
    <>
      {icon && (
        <span className="grid size-9 shrink-0 place-content-center rounded-md bg-surface text-fg-body [&_svg]:size-5">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-body-sm-medium text-fg-heading">{title}</span>
        {detail && <span className="truncate type-caption text-fg-body">{detail}</span>}
        {meta && <span className="truncate type-caption text-fg-caption">{meta}</span>}
      </span>
      {status}
      {to && <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />}
    </>
  );
  return (
    <li>
      {to ? (
        <Link
          to={to}
          params={params}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">{body}</div>
      )}
    </li>
  );
}

/** Two or more segments (e.g. "Active (2)" / "Past (5)"), one chosen. */
export function Segments<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex w-full max-w-md rounded-lg bg-line p-1 sm:w-auto sm:min-w-80"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-md px-4 py-1.5 type-body-sm-regular transition-colors",
            option.value === value
              ? "bg-card text-fg-heading shadow-sm"
              : "text-fg-caption hover:text-fg-heading",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** A small uppercase label above a group, e.g. "DETAILS" or "FROM THIS VISIT". */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="type-caption-medium tracking-wide text-fg-caption uppercase">{children}</p>;
}

/** Label / value rows in a white card, for a detail page. */
export function DetailRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="flex flex-col divide-y rounded-xl border bg-card">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="type-body-sm-regular text-fg-caption">{label}</dt>
          <dd className="text-right type-body-sm-medium text-fg-heading">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "Something not right? Report a change". TODO(api): nowhere to send a correction yet. */
export function ReportChange() {
  return (
    <p className="text-center type-caption text-fg-caption">
      Something not right?{" "}
      <button
        type="button"
        onClick={() => toast.info("Reporting a change isn’t available yet.")}
        className="type-caption-medium text-primary hover:underline"
      >
        Report a change
      </button>
    </p>
  );
}
