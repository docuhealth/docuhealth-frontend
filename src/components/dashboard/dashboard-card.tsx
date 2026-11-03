import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White, rounded panel holding one dashboard section; `title` labels it. */
export function DashboardCard({
  title,
  action,
  className,
  children,
}: {
  title: ReactNode;
  /** Sits opposite the title, e.g. a search box. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("@container flex min-w-0 flex-col rounded-xl border bg-card p-4", className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="type-h5">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
