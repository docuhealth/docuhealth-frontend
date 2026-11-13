import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A white panel on the scan order page: a title (and `description`) ruled off from the body. */
export function OrderCard({
  title,
  description,
  action,
  tone = "card",
  className,
  children,
}: {
  title: string;
  description?: string;
  /** Sits opposite the title, e.g. a status pill. */
  action?: ReactNode;
  /** "primary" tints the panel in the brand color, for the impression. */
  tone?: "card" | "primary";
  className?: string;
  children: ReactNode;
}) {
  const id = `order-card-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl p-4 sm:p-5",
        tone === "primary" ? "bg-primary/10" : "border bg-card",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start justify-between gap-3 border-b pb-4",
          tone === "primary" && "border-primary/15",
        )}
      >
        <div className="flex flex-col gap-0.5">
          <h2
            id={id}
            className={cn(
              "type-body-sm-tight-semibold",
              tone === "primary" ? "text-primary" : "text-fg-heading",
            )}
          >
            {title}
          </h2>
          {description && <p className="type-body-sm-regular text-fg-caption">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** A labelled value in a list: its icon and label on the left, the value on the right. */
export function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <dt className="flex items-center gap-2 type-body-sm-regular text-fg-caption [&_svg]:size-4 [&_svg]:shrink-0">
        {icon}
        {label}
      </dt>
      <dd className="flex min-w-0 items-center gap-2 text-right type-body-sm-regular text-fg-heading">
        {children}
      </dd>
    </div>
  );
}
