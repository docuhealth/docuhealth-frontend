import { CalendarDotsIcon, FlaskIcon, PillIcon, PulseIcon } from "@phosphor-icons/react";
import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { CarePlan } from "@/features/patient/api/pending";
import { RecordRow } from "@/features/patient/components/patient-ui";
import { cn } from "@/lib/utils";

type Kind = CarePlan["items"][number]["kind"];

const kinds: Record<Kind, { icon: ReactNode; tile: string; to?: LinkProps["to"] }> = {
  medication: {
    icon: <PillIcon />,
    tile: "bg-success-100 text-success-500",
    to: "/patient/health/medications",
  },
  monitoring: { icon: <PulseIcon />, tile: "bg-brand-50 text-purple-500" },
  visit: {
    icon: <CalendarDotsIcon />,
    tile: "bg-warning-100 text-warning-500",
    to: "/patient/appointments",
  },
  test: { icon: <FlaskIcon />, tile: "bg-info-100 text-info-500" },
};

/**
 * One thing in a care plan, on a tile tinted by its kind. A medicine opens the medications page
 * and a visit the appointments page. TODO(api): items carry no id, so they can't open the exact
 * medicine or appointment, and a monitoring task or test has nowhere to go.
 */
export function PlanItemRow({
  kind,
  title,
  detail,
}: {
  kind: Kind;
  title: string;
  detail: string;
}) {
  const { icon, tile, to } = kinds[kind];
  return (
    <RecordRow
      icon={<span className={cn("grid size-9 place-content-center rounded-md", tile)}>{icon}</span>}
      title={title}
      detail={detail}
      to={to}
    />
  );
}
