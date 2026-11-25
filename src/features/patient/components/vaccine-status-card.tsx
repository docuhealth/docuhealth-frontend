import { ClockCountdownIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const kinds = {
  due: { label: "Due by", tag: "bg-error-500", icon: <ClockCountdownIcon aria-hidden /> },
  protection: { label: "Protection", tag: "bg-info-500", icon: <ShieldCheckIcon aria-hidden /> },
};

/**
 * A vaccine's state as a tagged card: "Due by" (red) or "Protection" (blue) over a rule, then a
 * big title, a line, and a tag on the right ("In 10 weeks", "Up to date"). Opens `to` when given.
 */
export function VaccineStatusCard({
  kind,
  title,
  detail,
  tag,
  to,
  params,
}: {
  kind: keyof typeof kinds;
  title: string;
  detail: string | null;
  tag: ReactNode;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
}) {
  const { label, tag: tagClass, icon } = kinds[kind];
  const body = (
    <>
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 type-caption-semibold text-white [&_svg]:size-3.5",
          tagClass,
        )}
      >
        {icon}
        {label}
      </span>
      <span className="flex flex-col gap-1 border-t pt-3">
        <span className="type-title text-fg-heading">{title}</span>
        <span className="flex items-center justify-between gap-3">
          <span className="type-caption text-fg-caption">{detail}</span>
          {tag}
        </span>
      </span>
    </>
  );
  const className = "flex flex-col gap-3 rounded-xl border bg-card p-4";
  return to ? (
    <Link
      to={to}
      params={params}
      aria-label={`${label}: ${title}`}
      className={cn(className, "transition-colors hover:border-primary/40")}
    >
      {body}
    </Link>
  ) : (
    <section aria-label={label} className={className}>
      {body}
    </section>
  );
}
