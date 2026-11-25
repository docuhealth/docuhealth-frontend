import { CaretRightIcon } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { Tag } from "@/features/patient/components/tag";
import { notYet } from "@/features/patient/lib/not-yet";
import { cn } from "@/lib/utils";

/** One kind of record on the Health page. */
export type RecordKind = {
  label: string;
  /** The record's colored icon, an SVG's URL from `src/assets/svgs`. */
  icon: string;
  /** The line under the label; null for "No record to display". */
  detail: string | null;
  /** A short flag on the right, e.g. "1 new" or "1 due". */
  badge?: { label: string; tone: "success" | "warning" } | null;
  /** Its page; without one the tile says the page isn't available yet. */
  to?: LinkProps["to"];
};

/** A tile in "Your Records": icon, label and count, opening that record's page. */
export function RecordTile({ record }: { record: RecordKind }) {
  const body = (
    <>
      <img src={record.icon} alt="" className="size-7 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-body-sm-medium text-fg-heading">{record.label}</span>
        <span className="truncate type-caption text-fg-caption">
          {record.detail ?? "No record to display"}
        </span>
      </span>
      {record.badge && <Tag tone={record.badge.tone}>{record.badge.label}</Tag>}
      <CaretRightIcon className="size-4 shrink-0 text-fg-caption" aria-hidden />
    </>
  );
  const className =
    "flex h-full items-center gap-3 rounded-xl border bg-card px-4 py-5 transition-colors";
  return record.to ? (
    <Link to={record.to} className={cn(className, "hover:border-primary/40")}>
      {body}
    </Link>
  ) : (
    <button
      type="button"
      onClick={notYet(record.label)}
      className={cn(className, "w-full text-left hover:border-fg-caption/40")}
    >
      {body}
    </button>
  );
}
