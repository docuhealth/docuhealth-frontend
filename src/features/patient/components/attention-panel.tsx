import { CaretRightIcon } from "@phosphor-icons/react";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tiles = {
  warning: "bg-warning-100 text-warning-700",
  info: "bg-info-100 text-info-700",
  success: "bg-success-100 text-success-700",
};

/**
 * The card under the "Needs your attention" tabs: an icon tile, a title over a line, an optional
 * badge, the rows, and a link to the full record.
 */
export function AttentionPanel({
  icon,
  tone,
  title,
  detail,
  badge,
  link,
  children,
}: {
  icon: ReactNode;
  tone: keyof typeof tiles;
  title: string;
  detail: ReactNode;
  badge?: ReactNode;
  link: { to: LinkProps["to"]; params?: LinkProps["params"]; label: string };
  children: ReactNode;
}) {
  return (
    <div role="tabpanel" aria-label={title} className="flex flex-col rounded-xl border bg-card">
      <div className="mx-5 flex items-start gap-3 border-b py-5">
        <span
          className={cn(
            "grid size-12 shrink-0 place-content-center rounded-lg [&_svg]:size-6",
            tiles[tone],
          )}
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate type-title-sm text-fg-heading">{title}</p>
          <p className="type-caption text-fg-caption">{detail}</p>
        </div>
        {badge}
      </div>
      <ul className="mx-5 flex flex-col divide-y border-b">{children}</ul>
      <Link
        to={link.to}
        params={link.params}
        className="flex items-center gap-1 self-start px-5 py-4 type-body-sm-medium text-fg-body hover:text-primary"
      >
        {link.label}
        <CaretRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}

/** One row in an `AttentionPanel`: a name on the left, a value or status on the right. */
export function AttentionRow({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="min-w-0 truncate type-body-sm-regular text-fg-heading">{name}</span>
      <span className="flex shrink-0 items-center gap-3">{children}</span>
    </li>
  );
}
