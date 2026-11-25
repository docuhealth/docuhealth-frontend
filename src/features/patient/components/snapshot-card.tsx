import { CheckCircleIcon, MinusCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

const tiles = {
  success: "bg-success-100 text-success-500",
  info: "bg-info-100 text-info-500",
  warning: "bg-warning-100 text-warning-500",
  error: "bg-error-100 text-error-500",
};

const noteTones = {
  good: { text: "text-success-500", icon: <CheckCircleIcon weight="fill" /> },
  near: { text: "text-warning-500", icon: <MinusCircleIcon weight="fill" /> },
  watch: { text: "text-warning-700", icon: <WarningCircleIcon weight="fill" /> },
  brand: { text: "text-primary", icon: null },
};

/**
 * The line under a reading: `label` with its first words (`lead`) colored by `tone` and the rest
 * grey ("**Just above** healthy"), led by the tone's icon or `icon`.
 */
export type SnapshotNote = {
  label: string;
  lead: string;
  tone: keyof typeof noteTones;
  icon?: ReactNode;
};

/**
 * One reading in the health snapshot: an icon in a tinted circle, what it is and when, the value
 * with its unit, and a note under it. Shows "-" and "No reading yet" when there's no value.
 */
export function SnapshotCard({
  icon,
  tone,
  label,
  value,
  unit,
  at,
  note,
}: {
  icon: ReactNode;
  tone: keyof typeof tiles;
  label: string;
  value: string | null;
  unit: string;
  at: string | null;
  note: SnapshotNote | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 type-body-sm-regular text-fg-caption">
          <span
            className={cn(
              "grid size-6 place-content-center rounded-full [&_svg]:size-3.5",
              tiles[tone],
            )}
          >
            {icon}
          </span>
          {label}
        </span>
        <span className="type-caption text-fg-caption">
          {at ? formatDayMonth(new Date(at)) : "-"}
        </span>
      </div>
      <p className="type-title-lg text-fg-heading">
        {value ?? "-"}
        <span className="type-body text-fg-caption">{unit}</span>
      </p>
      <Note note={note} />
    </div>
  );
}

function Note({ note }: { note: SnapshotNote | null }) {
  if (!note) {
    return (
      <p className="flex items-center gap-1.5 type-caption text-fg-caption">
        <span className="size-3.5 rounded-full border" />
        No reading yet
      </p>
    );
  }
  const tone = noteTones[note.tone];
  return (
    <p className="flex items-center gap-1.5 type-caption text-fg-caption">
      <span className={cn("shrink-0 [&_svg]:size-4", tone.text)}>{note.icon ?? tone.icon}</span>
      <span>
        <span className={tone.text}>{note.lead}</span>
        {note.label.slice(note.lead.length)}
      </span>
    </p>
  );
}
