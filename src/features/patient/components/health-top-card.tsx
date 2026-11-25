import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A card at the top of the Health page (Documents, Healthcare facilities): icon, title, line, action. */
export function HealthTopCard({
  icon,
  iconClass,
  title,
  detail,
  action,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  detail: string;
  action: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
      <span className={cn("grid size-12 shrink-0 place-content-center rounded-lg", iconClass)}>
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="type-body-sm-medium text-fg-heading">{title}</p>
        <p className="truncate type-caption text-fg-caption">{detail}</p>
      </div>
      {action}
    </div>
  );
}
