import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A titled section of a profile page. `action` sits opposite the title; the header is ruled off
 * from the content unless `divider` is false (e.g. when tabs follow it).
 */
export function ProfileCard({
  title,
  description,
  action,
  divider = true,
  className,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  divider?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5", className)}>
      <header
        className={cn(
          "flex flex-wrap items-start justify-between gap-3",
          divider && "border-b pb-4",
        )}
      >
        <div className="flex min-w-48 flex-1 flex-col gap-1">
          <h2 className="type-h5">{title}</h2>
          <p className="type-body-sm-regular text-fg-caption">{description}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** One labelled detail in a `ProfileCard`'s `<dl>`: icon and label left, value right. */
export function InfoRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="flex shrink-0 items-center gap-2 type-body-sm-regular text-fg-caption [&_svg]:size-4.5">
        {icon}
        {label}
      </dt>
      <dd className="min-w-0 text-right type-body-sm-regular wrap-anywhere text-fg-heading">
        {children}
      </dd>
    </div>
  );
}
